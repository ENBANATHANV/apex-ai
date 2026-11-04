import { Router } from 'express';
import {
  getDailyNutrition,
  logMeal,
  deleteMealItem,
  logWater,
  getFoodDatabase,
  getWeeklyNutrition,
} from '../controllers/nutritionController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/daily', getDailyNutrition);
router.post('/log', logMeal);
router.delete('/log/:id', deleteMealItem);
router.post('/water', logWater);
router.get('/database', getFoodDatabase);
router.get('/weekly', getWeeklyNutrition);

export default router;
