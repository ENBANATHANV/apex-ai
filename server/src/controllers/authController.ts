import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'fittrack-super-secure-jwt-secret-key-2026-production-grade';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'user',
        profile: {
          create: {
            fullName: fullName.trim(),
            onboardingCompleted: false,
            dailyCalorieTarget: 2200,
            dailyWaterTargetMl: 2500,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to FitTrack! 🚀',
        message: 'Complete your onboarding assessment to receive customized AI workout and nutrition recommendations.',
        type: 'SYSTEM',
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user account.', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed due to server error.', error: error.message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // Stateless JWT logout
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Return 200 to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If that email address is registered, a password reset link has been dispatched.',
      });
      return;
    }

    // In production, an email service (SendGrid, Postmark, AWS SES) would send a reset token link.
    // For local evaluation and testing, we generate a mock token and provide instructions.
    const resetToken = jwt.sign({ id: user.id, purpose: 'reset' }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      success: true,
      message: 'Password reset link simulated successfully.',
      resetToken, // Returned in dev mode for easy testing
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to process forgot password request.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving user session.' });
  }
};
