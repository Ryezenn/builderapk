import { Router } from 'express';
import {
  getOverview,
  getBuildsChart,
  getApiChart,
  getTopEndpoints,
  getRevenueChart,
} from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/overview', authMiddleware as any, getOverview as any);
router.get('/builds/chart', authMiddleware as any, getBuildsChart as any);
router.get('/api/:id/chart', authMiddleware as any, getApiChart as any);
router.get('/api/:id/top-endpoints', authMiddleware as any, getTopEndpoints as any);
router.get('/revenue', authMiddleware as any, getRevenueChart as any);

export default router;
