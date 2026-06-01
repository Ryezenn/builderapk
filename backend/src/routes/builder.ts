import { Router } from 'express';
import {
  buildApk,
  getBuilds,
  getBuild,
  downloadApk,
  deleteBuild,
  streamStatus,
} from '../controllers/builderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/build', authMiddleware as any, buildApk as any);
router.get('/builds', authMiddleware as any, getBuilds as any);
router.get('/builds/:id', authMiddleware as any, getBuild as any);
router.get('/builds/:id/download', authMiddleware as any, downloadApk as any);
router.delete('/builds/:id', authMiddleware as any, deleteBuild as any);
router.get('/status/:id', streamStatus as any); // Public or cookies authorized channel for SSE

export default router;
