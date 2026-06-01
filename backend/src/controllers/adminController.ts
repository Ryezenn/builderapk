import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        avatarUrl: true,
        _count: {
          select: { apkBuilds: true, apis: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error listing platform tenants' });
  }
};

export const updateUserPlan = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { plan } = req.body; // FREE, STARTER, PRO, ENTERPRISE

  if (!plan) return res.status(400).json({ error: 'Plan is required' });

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { plan },
      select: { id: true, email: true, name: true, plan: true },
    });
    return res.json({
      message: `User plan upgraded to ${plan} successfully`,
      user: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error modifying tenant plan details' });
  }
};

export const getApis = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const apis = await prisma.api.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(apis);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching central APIs' });
  }
};

export const updateApiStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // ACTIVE, INACTIVE, SUSPENDED

  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const updated = await prisma.api.update({
      where: { id },
      data: { status },
    });
    return res.json({
      message: `API moderation state updated to ${status} successfully`,
      api: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error altering API moderation states' });
  }
};

export const getBuilds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const builds = await prisma.apkBuild.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(builds);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching global builds queue' });
  }
};

export const getSystemLogs = async (req: AuthenticatedRequest, res: Response) => {
  // Mock standard server log streams for dashboard viewer
  const logs = [
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'BuildrX Express gateway client booted successfully.' },
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'Redis pub/sub channels synchronized.' },
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'BullMQ Queue worker processes initialized.' },
    { timestamp: new Date().toISOString(), level: 'WARN', message: 'AWS S3 credentials not found. Defaulting to local public storage fallback.' },
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'Gateway proxy routing configuration loaded: 24 active APIs.' },
  ];
  return res.json(logs);
};
