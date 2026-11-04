import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, forgotPassword, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('fullName').notEmpty().withMessage('Full name is required.'),
    validateRequest,
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
    validateRequest,
  ],
  login
);

router.post('/logout', logout);
router.post('/forgot-password', [body('email').isEmail(), validateRequest], forgotPassword);
router.get('/me', authenticateToken, getMe);

export default router;
