import { Router } from 'express';
import {
  getProgress,
  logProgress,
  getAnalytics,
  getGoals,
  createGoal,
  updateGoal,
} from '../controllers/progressController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getProgress);
router.post('/', logProgress);
router.get('/analytics', getAnalytics);
router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.put('/goals/:id', updateGoal);

export default router;
