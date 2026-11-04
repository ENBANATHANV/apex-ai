import { Router } from 'express';
import { getProfile, updateProfile, completeOnboarding, getDashboardSummary } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/onboarding', completeOnboarding);
router.get('/dashboard-summary', getDashboardSummary);

export default router;
