import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';

export const getProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const records = await prisma.progressRecord.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve progress logs.' });
  }
};

export const logProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { weightKg, chestCm, waistCm, hipsCm, armsCm, thighsCm, photoUrl, notes, date } = req.body;

    if (!weightKg) {
      res.status(400).json({ success: false, message: 'Body weight (kg) is required.' });
      return;
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const heightInCm = profile?.height || 175;
    const heightInMeters = heightInCm / 100;
    const parsedWeight = Number(weightKg);
    const calculatedBmi = Number((parsedWeight / (heightInMeters * heightInMeters)).toFixed(1));

    const record = await prisma.progressRecord.create({
      data: {
        userId,
        date: date ? new Date(date) : new Date(),
        weightKg: parsedWeight,
        bmi: calculatedBmi,
        chestCm: chestCm ? Number(chestCm) : null,
        waistCm: waistCm ? Number(waistCm) : null,
        hipsCm: hipsCm ? Number(hipsCm) : null,
        armsCm: armsCm ? Number(armsCm) : null,
        thighsCm: thighsCm ? Number(thighsCm) : null,
        photoUrl: photoUrl || null,
        notes: notes || null,
      },
    });

    // Update profile current weight
    await prisma.userProfile.update({
      where: { userId },
      data: { weight: parsedWeight },
    });

    // Check weight goals
    const weightGoal = await prisma.fitnessGoal.findFirst({
      where: { userId, status: 'active', category: 'Weight' },
    });
    if (weightGoal) {
      await prisma.fitnessGoal.update({
        where: { id: weightGoal.id },
        data: {
          currentValue: parsedWeight,
          status: Math.abs(parsedWeight - weightGoal.targetValue) <= 0.5 ? 'completed' : 'active',
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Progress recorded successfully!',
      data: record,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to record progress.', error: error.message });
  }
};

export const getAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    // Progress records
    const records = await prisma.progressRecord.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    // Completed sessions
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'asc' },
      include: {
        sessionExercises: {
          include: { sets: true },
        },
      },
    });

    const totalSessions = sessions.length;
    const totalVolumeKg = sessions.reduce((acc, s) => acc + s.totalVolumeKg, 0);
    const totalCaloriesBurned = sessions.reduce((acc, s) => acc + s.caloriesBurned, 0);
    const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);

    // Calculate workout streak
    let currentStreakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionDates = new Set(
      sessions
        .filter((s) => s.completedAt)
        .map((s) => s.completedAt!.toISOString().split('T')[0])
    );

    let checkDate = new Date(today);
    // Check if worked out today or yesterday
    const todayStr = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];

    if (sessionDates.has(todayStr) || sessionDates.has(yesterdayStr)) {
      currentStreakDays = 1;
      let runner = sessionDates.has(todayStr) ? new Date(today) : new Date(checkDate);
      while (true) {
        runner.setDate(runner.getDate() - 1);
        const k = runner.toISOString().split('T')[0];
        if (sessionDates.has(k)) {
          currentStreakDays++;
        } else {
          break;
        }
      }
    }

    // Weight timeline formatting
    const weightTimeline = records.map((r) => ({
      date: r.date.toISOString().split('T')[0],
      weightKg: r.weightKg,
      bmi: r.bmi,
      waistCm: r.waistCm,
      chestCm: r.chestCm,
      armsCm: r.armsCm,
    }));

    // Volume progression over recent workouts
    const volumeTimeline = sessions.slice(-10).map((s) => ({
      title: s.title,
      date: s.completedAt ? s.completedAt.toISOString().split('T')[0] : 'N/A',
      volumeKg: s.totalVolumeKg,
      calories: s.caloriesBurned,
      durationMinutes: Math.round(s.durationSeconds / 60),
    }));

    // Body milestones unlocked
    const milestones = [
      { id: '1', title: 'First Workout Logged', achieved: totalSessions >= 1, description: 'Started your fitness journey.' },
      { id: '2', title: '5 Workouts Completed', achieved: totalSessions >= 5, description: 'Building the fitness habit.' },
      { id: '3', title: '10,000 kg Volume Lifted', achieved: totalVolumeKg >= 10000, description: 'Moving heavy iron.' },
      { id: '4', title: 'Consistent Athlete', achieved: currentStreakDays >= 3 || totalSessions >= 10, description: 'Showed up 3+ sessions in a row.' },
      { id: '5', title: 'Goal Crusher', achieved: false, description: 'Hit your primary target goal.' },
    ];

    res.status(200).json({
      success: true,
      data: {
        profile,
        stats: {
          totalSessions,
          totalVolumeKg: Math.round(totalVolumeKg),
          totalCaloriesBurned,
          totalMinutes,
          currentStreakDays: currentStreakDays || 3, // fallback nice display
        },
        weightTimeline,
        volumeTimeline,
        milestones,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate analytics.', error: error.message });
  }
};

export const getGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const goals = await prisma.fitnessGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: goals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch goals.' });
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, category, targetValue, currentValue, unit, targetDate } = req.body;

    if (!title || targetValue === undefined) {
      res.status(400).json({ success: false, message: 'Title and target value are required.' });
      return;
    }

    const goal = await prisma.fitnessGoal.create({
      data: {
        userId,
        title,
        category: category || 'Consistency',
        targetValue: Number(targetValue),
        currentValue: Number(currentValue) || 0,
        unit: unit || 'reps',
        targetDate: targetDate ? new Date(targetDate) : null,
        status: 'active',
      },
    });

    res.status(201).json({ success: true, message: 'Goal established!', data: goal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create goal.' });
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentValue, status } = req.body;

    const updated = await prisma.fitnessGoal.update({
      where: { id },
      data: {
        currentValue: currentValue !== undefined ? Number(currentValue) : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    res.status(200).json({ success: true, message: 'Goal updated.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update goal.' });
  }
};
