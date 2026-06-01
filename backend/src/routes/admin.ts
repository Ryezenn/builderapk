import { Router } from 'express';
import {
  getUsers,
  updateUserPlan,
  getApis,
  updateApiStatus,
  getBuilds,
  getSystemLogs,
} from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Secure entire admin module with auth and admin constraints
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

router.get('/users', getUsers as any);
router.put('/users/:id/plan', updateUserPlan as any);
router.get('/apis', getApis as any);
router.put('/apis/:id/status', updateApiStatus as any);
router.get('/builds', getBuilds as any);
router.get('/logs', getSystemLogs as any);

export default router;
