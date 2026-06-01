import { Router } from 'express';
import {
  extractApiKey,
  validateApiKey,
  checkApiQuota,
  slidingWindowRateLimit,
  logAndProxyRequest,
} from '../middleware/gateway';

const router = Router();

// Matches ALL HTTP methods on "/gateway/:apiSlug/*" paths
router.all(
  '/:apiSlug/*',
  extractApiKey as any,
  validateApiKey as any,
  checkApiQuota as any,
  slidingWindowRateLimit as any,
  logAndProxyRequest as any
);

export default router;
