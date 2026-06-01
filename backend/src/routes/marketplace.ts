import { Router } from 'express';
import {
  listApis,
  getApiBySlug,
  publishApi,
  updateApi,
  deleteApi,
  subscribeToApi,
} from '../controllers/marketplaceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', listApis);
router.get('/:slug', getApiBySlug);
router.post('/', authMiddleware as any, publishApi as any);
router.put('/:id', authMiddleware as any, updateApi as any);
router.delete('/:id', authMiddleware as any, deleteApi as any);
router.post('/:id/subscribe', authMiddleware as any, subscribeToApi as any);

export default router;
