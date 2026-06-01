import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { redisClient } from '../config/redis';
import { createProxyMiddleware } from 'http-proxy-middleware';

export interface GatewayRequest extends Request {
  apiKeyRecord?: {
    id: string;
    userId: string;
    apiId: string;
    key: string;
    isActive: boolean;
    callsLimit: string | null;
    api: {
      id: string;
      baseUrl: string;
      slug: string;
      rateLimit: number;
      isPaid: boolean;
      freeQuota: number;
      paidQuota: number | null;
    };
  };
  startTime?: number;
}

export const extractApiKey = (req: GatewayRequest, res: Response, next: NextFunction) => {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (!key) {
    return res.status(401).json({ error: 'Gateway Auth Error: API Key required in x-api-key header or api_key query parameter.' });
  }
  next();
};

export const validateApiKey = async (req: GatewayRequest, res: Response, next: NextFunction) => {
  const key = (req.headers['x-api-key'] || req.query.api_key) as string;
  const { apiSlug } = req.params;

  req.startTime = Date.now();

  try {
    const cacheKey = `gateway:key:${key}:${apiSlug}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      req.apiKeyRecord = JSON.parse(cached);
      return next();
    }

    // Query database with joins
    const apiKey = await prisma.apiKey.findFirst({
      where: { key, isActive: true, api: { slug: apiSlug } },
      include: {
        api: true,
      },
    });

    if (!apiKey) {
      return res.status(401).json({ error: 'Gateway Auth Error: Invalid API key or not authorized to access this API route.' });
    }

    const payload = {
      id: apiKey.id,
      userId: apiKey.userId,
      apiId: apiKey.apiId,
      key: apiKey.key,
      isActive: apiKey.isActive,
      callsLimit: apiKey.callsLimit?.toString() || null,
      api: {
        id: apiKey.api.id,
        baseUrl: apiKey.api.baseUrl,
        slug: apiKey.api.slug,
        rateLimit: apiKey.api.rateLimit,
        isPaid: apiKey.api.isPaid,
        freeQuota: apiKey.api.freeQuota,
        paidQuota: apiKey.api.paidQuota,
      },
    };

    // Cache in Redis for 5 minutes
    await redisClient.set(cacheKey, JSON.stringify(payload), { EX: 300 });
    req.apiKeyRecord = payload;
    next();
  } catch (error) {
    console.error('Gateway validation error:', error);
    return res.status(500).json({ error: 'Internal gateway verification error' });
  }
};

export const checkApiQuota = async (req: GatewayRequest, res: Response, next: NextFunction) => {
  const keyRecord = req.apiKeyRecord;
  if (!keyRecord) return res.status(500).json({ error: 'Internal validation mismatch' });

  try {
    const currentMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-06"
    const quotaKey = `gateway:quota:${keyRecord.id}:${currentMonth}`;

    // Get limit based on plan / quota
    const limit = keyRecord.api.isPaid
      ? (keyRecord.api.paidQuota || 50000)
      : keyRecord.api.freeQuota;

    const count = await redisClient.incr(quotaKey);
    
    // Set expiry for quota counter if new key
    if (count === 1) {
      await redisClient.expire(quotaKey, 32 * 24 * 60 * 60); // 32 days
    }

    if (count > limit) {
      return res.status(429).json({
        error: `Quota exceeded: You have utilized your monthly allowance of ${limit} calls for this API.`,
      });
    }

    next();
  } catch (error) {
    next(); // Fail open for quotas in case of Redis outage, or restrict. Let's fail open to ensure robustness.
  }
};

export const slidingWindowRateLimit = async (req: GatewayRequest, res: Response, next: NextFunction) => {
  const keyRecord = req.apiKeyRecord;
  if (!keyRecord) return res.status(500).json({ error: 'Internal validation mismatch' });

  const limit = keyRecord.api.rateLimit || 60; // default 60 req/min
  const keyId = keyRecord.id;

  try {
    const now = Date.now();
    const rateLimitKey = `gateway:ratelimit:${keyId}`;
    const windowStart = now - 60000; // 1 minute window

    // Use multi pipeline for atomic execution
    const multi = redisClient.multi();
    
    // Remove old logs outside of window
    multi.zRemRangeByScore(rateLimitKey, 0, windowStart);
    
    // Add current call log timestamp
    multi.zAdd(rateLimitKey, { score: now, value: String(now) });
    
    // Count active logs in window
    multi.zCard(rateLimitKey);
    
    // Set TTL on window set
    multi.expire(rateLimitKey, 65);

    const results = await multi.exec();
    const activeRequests = results[2] as number;

    if (activeRequests > limit) {
      return res.status(429).json({
        error: `Too Many Requests: Rate limit of ${limit} requests per minute exceeded.`,
      });
    }

    next();
  } catch (error) {
    next(); // Fail open
  }
};

export const logAndProxyRequest = (req: GatewayRequest, res: Response, next: NextFunction) => {
  const keyRecord = req.apiKeyRecord;
  if (!keyRecord) return res.status(500).json({ error: 'Internal validation mismatch' });

  const apiSlug = req.params.apiSlug;
  const upstreamUrl = keyRecord.api.baseUrl;

  // Set up proxy middleware handler
  const proxy = createProxyMiddleware({
    target: upstreamUrl,
    changeOrigin: true,
    pathRewrite: (pathStr, request) => {
      // Replaces "/gateway/slug/endpoint" -> "/endpoint"
      return pathStr.replace(new RegExp(`^/gateway/${apiSlug}`), '');
    },
    on: {
      proxyRes: (proxyResponse, request: any, response) => {
        // Record latency
        const latencyMs = Date.now() - (req.startTime || Date.now());
        const statusCode = proxyResponse.statusCode || 200;

        // Async log writing to database (Non-blocking)
        prisma.apiLog.create({
          data: {
            apiKeyId: keyRecord.id,
            method: req.method,
            path: req.path.replace(new RegExp(`^/gateway/${apiSlug}`), ''),
            statusCode,
            latencyMs,
            ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
            userAgent: req.headers['user-agent'] || '',
          },
        }).then(() => {
          // Increment used counter in API / APIKey records
          prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { callsUsed: { increment: 1 } }
          }).catch(console.error);

          prisma.api.update({
            where: { id: keyRecord.apiId },
            data: { totalCalls: { increment: 1 } }
          }).catch(console.error);
        }).catch(console.error);

        // Strip sensitive upstream headers
        delete proxyResponse.headers['server'];
        delete proxyResponse.headers['x-powered-by'];
        delete proxyResponse.headers['x-aspnet-version'];
      },
      error: (err, request, response: any) => {
        console.error('Proxy routing error:', err);
        response.status(502).json({ error: 'Gateway Routing Error: Upstream service unreachable.' });
      }
    }
  });

  proxy(req, res, next);
};
