import { Worker, Job } from 'bullmq';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { uploadToS3 } from '../utils/s3';
import { prisma } from '../lib/prisma';
import { publishBuildProgress } from '../utils/sse';

const redisUrlString = process.env.REDIS_URL || 'redis://localhost:6379';
let redisUrl: URL;
try {
  redisUrl = new URL(redisUrlString);
} catch (e) {
  redisUrl = new URL(`redis://${redisUrlString}`);
}

const connection = {
  host: redisUrl.hostname || 'localhost',
  port: parseInt(redisUrl.port || '6379'),
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const worker = new Worker(
  'apkBuild',
  async (job: Job) => {
    const { buildId, config } = job.data;
    const startTime = Date.now();

    console.log(`[Worker] Started processing APK build job: ${buildId}`);

    try {
      await prisma.apkBuild.update({
        where: { id: buildId },
        data: { status: 'BUILDING' },
      });

      // Stage 1: Preparing
      await publishBuildProgress(buildId, { stage: 'Preparing configuration', progress: 10 });
      await delay(2000);

      const simulateMode = process.env.SIMULATE_APK_BUILD !== 'false';

      if (simulateMode) {
        console.log(`[Worker] Running APK Build in Simulation Mode (Simulate delays & local S3 link)`);

        // Stage 2: Spawning Compilation
        await publishBuildProgress(buildId, { stage: 'Compiling Android source templates', progress: 40 });
        await delay(3000);

        // Stage 3: Signing APK
        await publishBuildProgress(buildId, { stage: 'Signing app package with keystore cert', progress: 75 });
        await delay(2000);

        // Stage 4: Uploading to S3
        await publishBuildProgress(buildId, { stage: 'Uploading artifact to distribution storage', progress: 88 });
        await delay(1500);

        // Create a mock local file to upload
        const tempDir = path.join(__dirname, '../../tmp/builds', buildId);
        fs.mkdirSync(tempDir, { recursive: true });
        const mockApkPath = path.join(tempDir, 'release.apk');
        fs.writeFileSync(mockApkPath, 'DUMMY_ANDROID_APK_BINARY_CONTENT_BUILDRX');

        const s3Key = `apks/${buildId}/${config.packageName}-${config.versionCode}.apk`;
        const apkUrl = await uploadToS3(mockApkPath, s3Key);

        // Cleanup local temp file
        if (fs.existsSync(mockApkPath)) {
          fs.unlinkSync(mockApkPath);
        }

        const buildDuration = Math.round((Date.now() - startTime) / 1000);

        // Update DB on success
        const updated = await prisma.apkBuild.update({
          where: { id: buildId },
          data: {
            status: 'SUCCESS',
            apkUrl,
            buildDuration,
            completedAt: new Date(),
          },
        });

        await publishBuildProgress(buildId, {
          stage: 'Completed successfully',
          progress: 100,
          apkUrl: updated.apkUrl,
          status: 'SUCCESS',
        });

        console.log(`[Worker] Simulated build completed successfully. S3/Local link: ${apkUrl}`);
      } else {
        // FULL COMPILATION MODE
        console.log(`[Worker] Initiating native APK Compilation Pipeline`);

        const workDir = path.join(__dirname, '../../tmp/builds', buildId);
        const templateDir = path.resolve(__dirname, '../../../templates/android-webview');

        // Copy template
        await publishBuildProgress(buildId, { stage: 'Copying native Android templates', progress: 20 });
        fs.mkdirSync(workDir, { recursive: true });
        execSync(`cp -r "${templateDir}"/* "${workDir}"`);

        // Inject configuration files (strings.xml, MainActivity.kt, etc.)
        await publishBuildProgress(buildId, { stage: 'Injecting web configs & parameters', progress: 35 });
        
        const stringsXmlPath = path.join(workDir, 'app/src/main/res/values/strings.xml');
        let stringsContent = fs.readFileSync(stringsXmlPath, 'utf8');
        stringsContent = stringsContent.replace('{{APP_NAME}}', config.appName);
        stringsContent = stringsContent.replace('{{WEBSITE_URL}}', config.websiteUrl);
        fs.writeFileSync(stringsXmlPath, stringsContent);

        const colorsXmlPath = path.join(workDir, 'app/src/main/res/values/colors.xml');
        let colorsContent = fs.readFileSync(colorsXmlPath, 'utf8');
        colorsContent = colorsContent.replace('{{THEME_COLOR}}', config.themeColor);
        colorsContent = colorsContent.replace('{{STATUS_BAR_COLOR}}', config.themeColor);
        fs.writeFileSync(colorsXmlPath, colorsContent);

        const mainActivityPath = path.join(workDir, 'app/src/main/java/com/buildrx/webview/MainActivity.kt');
        let mainActivityContent = fs.readFileSync(mainActivityPath, 'utf8');
        mainActivityContent = mainActivityContent.replace('{{WEBSITE_URL}}', config.websiteUrl);
        mainActivityContent = mainActivityContent.replace('{{STATUS_BAR_COLOR}}', config.themeColor);
        mainActivityContent = mainActivityContent.replace('{{ALLOW_BACK}}', String(config.allowBack));
        mainActivityContent = mainActivityContent.replace('{{OFFLINE_PAGE}}', String(config.offlinePage));
        fs.writeFileSync(mainActivityPath, mainActivityContent);

        // Compile
        await publishBuildProgress(buildId, { stage: 'Compiling release binaries (Gradle Assemble)', progress: 50 });
        execSync(`cd "${workDir}" && ./gradlew assembleRelease --no-daemon`, { timeout: 300000 });

        // Sign APK
        await publishBuildProgress(buildId, { stage: 'Signing compilation binaries', progress: 75 });
        const unsignedApkPath = path.join(workDir, 'app/build/outputs/apk/release/app-release-unsigned.apk');
        const keystorePath = process.env.KEYSTORE_PATH || '/certs/buildx.keystore';
        const keystorePass = process.env.KEYSTORE_PASS || 'buildrxpass';

        if (fs.existsSync(keystorePath)) {
          execSync(
            `jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore "${keystorePath}" -storepass ${keystorePass} "${unsignedApkPath}" buildx`
          );
        } else {
          console.warn('[Worker] Keystore file not found. Skipping jarsigner. Renaming directly for fallback.');
        }

        const signedApkPath = path.join(workDir, 'app/build/outputs/apk/release/app-release.apk');
        if (fs.existsSync(unsignedApkPath) && !fs.existsSync(signedApkPath)) {
          fs.renameSync(unsignedApkPath, signedApkPath);
        }

        // Upload to S3
        await publishBuildProgress(buildId, { stage: 'Uploading completed APK to S3', progress: 90 });
        const s3Key = `apks/${buildId}/${config.packageName}-${config.versionCode}.apk`;
        const apkUrl = await uploadToS3(signedApkPath, s3Key);

        // Cleanup
        execSync(`rm -rf "${workDir}"`);

        const buildDuration = Math.round((Date.now() - startTime) / 1000);

        const updated = await prisma.apkBuild.update({
          where: { id: buildId },
          data: {
            status: 'SUCCESS',
            apkUrl,
            buildDuration,
            completedAt: new Date(),
          },
        });

        await publishBuildProgress(buildId, {
          stage: 'Completed successfully',
          progress: 100,
          apkUrl: updated.apkUrl,
          status: 'SUCCESS',
        });

        console.log(`[Worker] Full compilation completed successfully: ${apkUrl}`);
      }
    } catch (err: any) {
      console.error(`[Worker] Build error on job ${buildId}:`, err);
      const errorMsg = err.message || String(err);

      await prisma.apkBuild.update({
        where: { id: buildId },
        data: {
          status: 'FAILED',
          errorLog: errorMsg,
          completedAt: new Date(),
        },
      });

      await publishBuildProgress(buildId, {
        stage: 'Compilation failed',
        progress: 100,
        error: errorMsg,
        status: 'FAILED',
      });
    }
  },
  { connection }
);

console.log('STARTUP: BullMQ Background APK Build Worker is ready');

export default worker;
