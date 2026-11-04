import { Router } from 'express';
import {
  generateWorkoutPlan,
  getNutritionAdvice,
  chatWithAi,
  getChatHistory,
} from '../controllers/aiController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/workout-plan', generateWorkoutPlan);
router.post('/nutrition-advice', getNutritionAdvice);
router.post('/chat', chatWithAi);
router.get('/chat/history', getChatHistory);

export default router;
