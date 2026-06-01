import { Response } from 'express';
import { Queue } from 'bullmq';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { subscribeBuildProgress } from '../utils/sse';
import fs from 'fs';
import path from 'path';

const redisUrlString = process.env.REDIS_URL || 'redis://localhost:6379';
let redisUrl: URL;
try {
  redisUrl = new URL(redisUrlString);
} catch (e) {
  // If it's something like "localhost:6379" without protocol
  redisUrl = new URL(`redis://${redisUrlString}`);
}

const buildQueue = new Queue('apkBuild', {
  connection: {
    host: redisUrl.hostname || 'localhost',
    port: parseInt(redisUrl.port || '6379'),
  },
});

export const buildApk = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const {
    appName,
    packageName,
    websiteUrl,
    themeColor,
    statusBar,
    orientation,
    allowBack,
    offlinePage,
    version,
    versionCode,
  } = req.body;

  if (!appName || !websiteUrl || !packageName) {
    return res.status(400).json({ error: 'App name, package name, and website URL are required' });
  }

  try {
    const build = await prisma.apkBuild.create({
      data: {
        userId: req.user.id,
        appName,
        packageName,
        websiteUrl,
        themeColor: themeColor || '#000000',
        statusBar: statusBar || 'dark',
        orientation: orientation || 'portrait',
        allowBack: allowBack !== undefined ? allowBack : true,
        offlinePage: offlinePage !== undefined ? offlinePage : false,
        version: version || '1.0.0',
        versionCode: versionCode ? parseInt(versionCode) : 1,
        status: 'QUEUED',
      },
    });

    // Add to BullMQ
    await buildQueue.add('apkBuildJob', {
      buildId: build.id,
      config: {
        appName,
        packageName,
        websiteUrl,
        themeColor: build.themeColor,
        statusBar: build.statusBar,
        orientation: build.orientation,
        allowBack: build.allowBack,
        offlinePage: build.offlinePage,
        version: build.version,
        versionCode: build.versionCode,
      },
    });

    return res.status(202).json({
      message: 'APK build enqueued successfully',
      build,
    });
  } catch (error) {
    console.error('Enqueue build error:', error);
    return res.status(500).json({ error: 'Internal server error enqueuing APK build' });
  }
};

export const getBuilds = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const total = await prisma.apkBuild.count({ where: { userId: req.user.id } });
    const builds = await prisma.apkBuild.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return res.json({
      builds,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching builds list' });
  }
};

export const getBuild = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  try {
    const build = await prisma.apkBuild.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!build) {
      return res.status(404).json({ error: 'Build record not found' });
    }

    return res.json(build);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching build details' });
  }
};

export const downloadApk = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  try {
    const build = await prisma.apkBuild.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!build || !build.apkUrl) {
      return res.status(404).json({ error: 'Build completed binaries not found or build failed' });
    }

    // Check if the URL is a local file link and redirect
    if (build.apkUrl.includes('/public/uploads')) {
      return res.redirect(build.apkUrl);
    }

    return res.json({ downloadUrl: build.apkUrl });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during download redirection' });
  }
};

export const deleteBuild = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  try {
    const build = await prisma.apkBuild.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!build) {
      return res.status(404).json({ error: 'Build record not found' });
    }

    // Attempt clean storage deletion
    if (build.apkUrl && build.apkUrl.includes('/public/uploads/')) {
      const fileName = build.apkUrl.split('/public/uploads/')[1];
      const localFilePath = path.join(__dirname, '../../public/uploads', fileName);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }

    await prisma.apkBuild.delete({ where: { id } });
    return res.json({ message: 'Build and binaries deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during record deletion' });
  }
};

export const streamStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // buildId/jobId
  console.log(`[SSE] client connection request for build stream: ${id}`);
  await subscribeBuildProgress(id, res);
};
