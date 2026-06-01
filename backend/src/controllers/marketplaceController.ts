import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listApis = async (req: Request, res: Response) => {
  const category = req.query.category as string;
  const search = req.query.search as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const skip = (page - 1) * limit;

  try {
    const where: any = { isPublic: true, status: 'ACTIVE' };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.api.count({ where });
    const apis = await prisma.api.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    return res.json({
      apis,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List APIs error:', error);
    return res.status(500).json({ error: 'Internal server error fetching marketplace APIs' });
  }
};

export const getApiBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const api = await prisma.api.findUnique({
      where: { slug },
      include: {
        endpoints: true,
        user: { select: { name: true, avatarUrl: true } },
      },
    });

    if (!api || api.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'API not found or inactive' });
    }

    return res.json(api);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching API details' });
  }
};

export const publishApi = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const {
    name,
    slug,
    description,
    baseUrl,
    category,
    isPublic,
    isPaid,
    pricePerMonth,
    freeQuota,
    paidQuota,
    rateLimit,
    endpoints,
  } = req.body;

  if (!name || !slug || !baseUrl || !category) {
    return res.status(400).json({ error: 'Name, slug, base URL, and category are required' });
  }

  try {
    const existingApi = await prisma.api.findUnique({ where: { slug } });
    if (existingApi) {
      return res.status(400).json({ error: 'An API with this slug already exists' });
    }

    // Process publishing in transaction to ensure integrity of API and its Endpoints
    const api = await prisma.$transaction(async (tx) => {
      const newApi = await tx.api.create({
        data: {
          userId: req.user!.id,
          name,
          slug,
          description: description || '',
          baseUrl,
          category,
          isPublic: isPublic !== undefined ? isPublic : true,
          isPaid: isPaid !== undefined ? isPaid : false,
          pricePerMonth: isPaid ? parseFloat(pricePerMonth || '0') : null,
          freeQuota: freeQuota ? parseInt(freeQuota) : 1000,
          paidQuota: isPaid && paidQuota ? parseInt(paidQuota) : null,
          rateLimit: rateLimit ? parseInt(rateLimit) : 60,
          status: 'ACTIVE',
        },
      });

      if (endpoints && Array.isArray(endpoints)) {
        for (const ep of endpoints) {
          await tx.endpoint.create({
            data: {
              apiId: newApi.id,
              method: ep.method,
              path: ep.path,
              summary: ep.summary,
              description: ep.description || '',
              parameters: ep.parameters || {},
              requestBody: ep.requestBody || {},
              responses: ep.responses || {},
              example: ep.example || {},
            },
          });
        }
      }

      return newApi;
    });

    return res.status(201).json({
      message: 'API published successfully',
      api,
    });
  } catch (error) {
    console.error('Publish API error:', error);
    return res.status(500).json({ error: 'Internal server error publishing API' });
  }
};

export const updateApi = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  const {
    name,
    description,
    baseUrl,
    category,
    isPublic,
    isPaid,
    pricePerMonth,
    freeQuota,
    paidQuota,
    rateLimit,
    endpoints,
  } = req.body;

  try {
    const existing = await prisma.api.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'API not found or unauthorized' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const api = await tx.api.update({
        where: { id },
        data: {
          name,
          description: description || '',
          baseUrl,
          category,
          isPublic: isPublic !== undefined ? isPublic : true,
          isPaid: isPaid !== undefined ? isPaid : false,
          pricePerMonth: isPaid ? parseFloat(pricePerMonth || '0') : null,
          freeQuota: freeQuota ? parseInt(freeQuota) : 1000,
          paidQuota: isPaid && paidQuota ? parseInt(paidQuota) : null,
          rateLimit: rateLimit ? parseInt(rateLimit) : 60,
        },
      });

      if (endpoints && Array.isArray(endpoints)) {
        // Simple re-sync strategy: delete old and write new endpoints
        await tx.endpoint.deleteMany({ where: { apiId: id } });
        for (const ep of endpoints) {
          await tx.endpoint.create({
            data: {
              apiId: id,
              method: ep.method,
              path: ep.path,
              summary: ep.summary,
              description: ep.description || '',
              parameters: ep.parameters || {},
              requestBody: ep.requestBody || {},
              responses: ep.responses || {},
              example: ep.example || {},
            },
          });
        }
      }

      return api;
    });

    return res.json({
      message: 'API config updated successfully',
      api: updated,
    });
  } catch (error) {
    console.error('Update API error:', error);
    return res.status(500).json({ error: 'Internal server error updating API details' });
  }
};

export const deleteApi = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  try {
    const api = await prisma.api.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!api) {
      return res.status(404).json({ error: 'API not found or unauthorized' });
    }

    await prisma.api.delete({ where: { id } });
    return res.json({ message: 'API listing removed successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error deleting API listing' });
  }
};

export const subscribeToApi = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params; // API ID
  const { plan } = req.body; // free, starter, pro

  if (!plan) return res.status(400).json({ error: 'Plan is required' });

  try {
    const api = await prisma.api.findUnique({ where: { id } });
    if (!api) return res.status(404).json({ error: 'API not found' });

    // Check if subscription already exists
    const existing = await prisma.subscription.findFirst({
      where: { userId: req.user.id, apiId: id, status: 'active' },
    });

    if (existing) {
      return res.status(400).json({ error: 'You are already subscribed to this API' });
    }

    const price = plan === 'free' ? 0 : api.pricePerMonth || 10;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days billing period

    const subscription = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          userId: req.user!.id,
          apiId: id,
          plan,
          status: 'active',
          expiresAt,
        },
      });

      // Generate invoice
      await tx.invoice.create({
        data: {
          userId: req.user!.id,
          amount: price,
          currency: 'USD',
          status: price === 0 ? 'paid' : 'pending',
          paymentRef: price === 0 ? 'FREE_TIER' : null,
          paidAt: price === 0 ? new Date() : null,
        },
      });

      return sub;
    });

    return res.status(201).json({
      message: `Subscribed to ${api.name} (${plan}) plan successfully`,
      subscription,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Internal server error subscribing to API' });
  }
};
