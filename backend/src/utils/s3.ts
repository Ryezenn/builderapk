import fs from 'fs';
import path from 'path';

export const uploadToS3 = async (localFilePath: string, s3Key: string): Promise<string> => {
  const s3Bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const s3Endpoint = process.env.AWS_S3_ENDPOINT || '';

  // If AWS S3 configuration is available, we would initialize the SDK here
  if (s3Bucket && accessKeyId && secretAccessKey) {
    console.log(`[S3] Uploading ${localFilePath} to bucket ${s3Bucket} key ${s3Key} (Simulated Cloud Upload)`);
    // Return standard cloud URL structure
    return s3Endpoint
      ? `${s3Endpoint}/${s3Bucket}/${s3Key}`
      : `https://${s3Bucket}.s3.amazonaws.com/${s3Key}`;
  }

  // Fallback: Store locally in a public assets directory
  console.log(`[Storage] Fallback enabled. Storing ${localFilePath} locally.`);
  const uploadDir = path.join(__dirname, '../../public/uploads');
  const targetPath = path.join(uploadDir, s3Key);

  // Ensure target folder structure exists
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  // Copy build APK to target path
  fs.copyFileSync(localFilePath, targetPath);

  // Return local HTTP relative link
  const serverPort = process.env.PORT || '3001';
  const appUrl = process.env.APP_URL || `http://localhost:${serverPort}`;
  return `${appUrl}/public/uploads/${s3Key}`;
};
