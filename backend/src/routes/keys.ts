import { Router } from 'express';
import {
  listKeys,
  generateKey,
  updateKey,
  revokeKey,
  getKeyLogs,
  getKeyUsage,
} from '../controllers/keysController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware as any, listKeys as any);
router.post('/', authMiddleware as any, generateKey as any);
router.put('/:id', authMiddleware as any, updateKey as any);
router.delete('/:id', authMiddleware as any, revokeKey as any);
router.get('/:id/logs', authMiddleware as any, getKeyLogs as any);
router.get('/:id/usage', authMiddleware as any, getKeyUsage as any);

export default router;
