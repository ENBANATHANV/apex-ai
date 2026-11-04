import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to mark notifications.' });
  }
};

export const clearNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    await prisma.notification.deleteMany({ where: { userId } });
    res.status(200).json({ success: true, message: 'All notifications cleared.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to clear notifications.' });
  }
};
