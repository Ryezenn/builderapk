import { Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { redisClient } from '../config/redis';

export const listKeys = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user.id },
      include: {
        api: { select: { name: true, slug: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(keys);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error listing keys' });
  }
};

export const generateKey = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { apiId, label, expiresAt, callsLimit } = req.body;

  if (!apiId) return res.status(400).json({ error: 'API ID is required' });

  try {
    const api = await prisma.api.findUnique({ where: { id: apiId } });
    if (!api) return res.status(404).json({ error: 'API not found' });

    // Validate subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: req.user.id, apiId, status: 'active' },
    });

    if (!subscription && api.userId !== req.user.id) {
      return res.status(403).json({ error: 'You are not subscribed to this API' });
    }

    // Generate cryptographic token
    const tokenBytes = crypto.randomBytes(24).toString('hex');
    const key = `bx_live_${tokenBytes}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: req.user.id,
        apiId,
        key,
        label: label || 'Default Key',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        callsLimit: callsLimit ? BigInt(callsLimit) : null,
      },
      include: {
        api: { select: { name: true, slug: true } },
      },
    });

    // Clean serialization of BigInt
    return res.status(201).json({
      message: 'API key generated successfully. Copy it now; it will not be displayed again.',
      apiKey: {
        ...apiKey,
        callsUsed: apiKey.callsUsed.toString(),
        callsLimit: apiKey.callsLimit?.toString() || null,
      },
    });
  } catch (error) {
    console.error('Generate key error:', error);
    return res.status(500).json({ error: 'Internal server error generating API key' });
  }
};

export const updateKey = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { label, isActive } = req.body;

  try {
    const existing = await prisma.apiKey.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) return res.status(404).json({ error: 'API key not found' });

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: {
        label,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    // Invalidate Redis cache
    await redisClient.del(`key:${existing.key}`).catch((err) =>
      console.error('Failed to clear redis key cache:', err)
    );

    return res.json({
      message: 'API key updated successfully',
      apiKey: {
        ...apiKey,
        callsUsed: apiKey.callsUsed.toString(),
        callsLimit: apiKey.callsLimit?.toString() || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error updating API key' });
  }
};

export const revokeKey = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  try {
    const existing = await prisma.apiKey.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) return res.status(404).json({ error: 'API key not found' });

    await prisma.apiKey.delete({ where: { id } });

    // Invalidate Redis cache
    await redisClient.del(`key:${existing.key}`).catch((err) =>
      console.error('Failed to clear redis key cache:', err)
    );

    return res.json({ message: 'API key revoked and deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error revoking API key' });
  }
};

export const getKeyLogs = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  try {
    const key = await prisma.apiKey.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!key) return res.status(404).json({ error: 'API key not found' });

    const total = await prisma.apiLog.count({ where: { apiKeyId: id } });
    const logs = await prisma.apiLog.findMany({
      where: { apiKeyId: id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching key logs' });
  }
};

export const getKeyUsage = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  try {
    const key = await prisma.apiKey.findFirst({
      where: { id, userId: req.user.id },
      include: { api: true },
    });

    if (!key) return res.status(404).json({ error: 'API key not found' });

    const totalCalls = await prisma.apiLog.count({ where: { apiKeyId: id } });

    // Fetch average latency
    const aggregations = await prisma.apiLog.aggregate({
      where: { apiKeyId: id },
      _avg: {
        latencyMs: true,
      },
    });

    // Calls today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const callsToday = await prisma.apiLog.count({
      where: {
        apiKeyId: id,
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    return res.json({
      keyId: key.id,
      label: key.label,
      apiName: key.api.name,
      totalCalls,
      callsToday,
      avgLatencyMs: Math.round(aggregations._avg.latencyMs || 0),
      callsUsed: key.callsUsed.toString(),
      callsLimit: key.callsLimit?.toString() || null,
      isActive: key.isActive,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error compiling usage analytics' });
  }
};
