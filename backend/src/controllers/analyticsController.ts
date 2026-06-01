import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getOverview = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Total APK builds for this user
    const totalBuilds = await prisma.apkBuild.count({
      where: { userId: req.user.id },
    });

    // Total API calls on user's published APIs
    const ownedApis = await prisma.api.findMany({
      where: { userId: req.user.id },
      select: { id: true, totalCalls: true },
    });
    
    const apiCallsVolume = ownedApis.reduce((sum, api) => sum + Number(api.totalCalls), 0);

    // Subscriptions count (Subscribed to other APIs or subscribers to user's APIs)
    const subscriptionsCount = await prisma.subscription.count({
      where: { userId: req.user.id, status: 'active' },
    });

    // Revenue generated from their published APIs (monetized API subscriptions paid by customers)
    const ownedApiIds = ownedApis.map((a) => a.id);
    
    // Total paid invoices for this user
    const totalInvoicesAmount = await prisma.invoice.aggregate({
      where: {
        userId: req.user.id,
        status: 'paid',
      },
      _sum: {
        amount: true,
      },
    });

    const revenue = totalInvoicesAmount._sum.amount || 0;

    return res.json({
      totalBuilds,
      apiCallsVolume,
      activeSubscriptions: subscriptionsCount,
      revenue,
    });
  } catch (error) {
    console.error('Analytics Overview Error:', error);
    return res.status(500).json({ error: 'Internal server error compiling overview metrics' });
  }
};

export const getBuildsChart = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const builds = await prisma.apkBuild.findMany({
      where: {
        userId: req.user.id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Group builds by date (YYYY-MM-DD)
    const grouped: { [key: string]: { total: number; success: number; failed: number } } = {};
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().substring(0, 10);
      grouped[dateStr] = { total: 0, success: 0, failed: 0 };
    }

    builds.forEach((b) => {
      const dateStr = b.createdAt.toISOString().substring(0, 10);
      if (grouped[dateStr]) {
        grouped[dateStr].total++;
        if (b.status === 'SUCCESS') grouped[dateStr].success++;
        if (b.status === 'FAILED') grouped[dateStr].failed++;
      }
    });

    const chartData = Object.keys(grouped).map((date) => ({
      date,
      ...grouped[date],
    })).sort((a, b) => a.date.localeCompare(b.date));

    return res.json(chartData);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error compiling builds chart metrics' });
  }
};

export const getApiChart = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params; // API ID

  try {
    const api = await prisma.api.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!api) return res.status(404).json({ error: 'API not found or unauthorized' });

    const past24h = new Date();
    past24h.setHours(past24h.getHours() - 24);

    const logs = await prisma.apiLog.findMany({
      where: {
        apiKey: { apiId: id },
        createdAt: {
          gte: past24h,
        },
      },
      select: {
        createdAt: true,
        statusCode: true,
      },
    });

    // Group logs by hour
    const grouped: { [key: string]: { calls: number; errors: number } } = {};

    for (let i = 0; i < 24; i++) {
      const d = new Date();
      d.setHours(d.getHours() - i);
      const hourStr = d.toISOString().substring(0, 13) + ':00'; // YYYY-MM-DDTHH:00
      grouped[hourStr] = { calls: 0, errors: 0 };
    }

    logs.forEach((log) => {
      const hourStr = log.createdAt.toISOString().substring(0, 13) + ':00';
      if (grouped[hourStr]) {
        grouped[hourStr].calls++;
        if (log.statusCode >= 400) {
          grouped[hourStr].errors++;
        }
      }
    });

    const chartData = Object.keys(grouped).map((hour) => ({
      hour: hour.split('T')[1].substring(0, 5), // return "HH:00" format
      ...grouped[hour],
    })).reverse();

    return res.json(chartData);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error compiling API traffic graphs' });
  }
};

export const getTopEndpoints = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  try {
    const api = await prisma.api.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!api) return res.status(404).json({ error: 'API not found' });

    // Group and count logs by method + path
    const logs = await prisma.apiLog.findMany({
      where: { apiKey: { apiId: id } },
      select: { method: true, path: true },
    });

    const counts: { [key: string]: { method: string; path: string; count: number } } = {};

    logs.forEach((log) => {
      const key = `${log.method} ${log.path}`;
      if (!counts[key]) {
        counts[key] = { method: log.method, path: log.path, count: 0 };
      }
      counts[key].count++;
    });

    const sortedData = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5 endpoints

    return res.json(sortedData);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error aggregating endpoint call counts' });
  }
};

export const getRevenueChart = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Collect all paid invoices for user
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: req.user.id,
        status: 'paid',
      },
      select: {
        amount: true,
        paidAt: true,
      },
    });

    const monthlyRevenue: { [key: string]: number } = {};

    // Generate last 6 months buckets
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyRevenue[key] = 0;
    }

    invoices.forEach((inv) => {
      if (inv.paidAt) {
        const key = inv.paidAt.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (monthlyRevenue[key] !== undefined) {
          monthlyRevenue[key] += inv.amount;
        }
      }
    });

    const chartData = Object.keys(monthlyRevenue).map((month) => ({
      month,
      revenue: monthlyRevenue[month],
    })).reverse();

    return res.json(chartData);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error compiling monthly revenue analytics' });
  }
};
