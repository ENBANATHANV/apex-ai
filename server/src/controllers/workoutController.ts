import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';

export const getWorkouts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { category, difficulty } = req.query;

    const whereClause: any = {
      OR: [{ userId }, { userId: null }],
    };

    if (category) whereClause.category = String(category);
    if (difficulty) whereClause.difficulty = String(difficulty);

    const plans = await prisma.workoutPlan.findMany({
      where: whereClause,
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: [{ dayOfWeek: 'asc' }, { order: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch workouts.', error: error.message });
  }
};

export const getWorkoutById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: [{ dayOfWeek: 'asc' }, { order: 'asc' }],
        },
      },
    });

    if (!plan) {
      res.status(404).json({ success: false, message: 'Workout plan not found.' });
      return;
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch workout plan.', error: error.message });
  }
};

export const createWorkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, description, category, difficulty, durationWeeks, daysPerWeek, isAiGenerated, exercises } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Workout plan title is required.' });
      return;
    }

    const plan = await prisma.workoutPlan.create({
      data: {
        userId,
        title,
        description: description || 'Custom training program.',
        category: category || 'Strength',
        difficulty: difficulty || 'Intermediate',
        durationWeeks: Number(durationWeeks) || 4,
        daysPerWeek: Number(daysPerWeek) || 4,
        isAiGenerated: Boolean(isAiGenerated),
        isCustom: true,
      },
    });

    if (Array.isArray(exercises) && exercises.length > 0) {
      for (let i = 0; i < exercises.length; i++) {
        const item = exercises[i];
        let exerciseId = item.exerciseId;

        // If exerciseId is missing but name is provided, find or create exercise
        if (!exerciseId && item.name) {
          let foundEx = await prisma.exercise.findFirst({ where: { name: item.name } });
          if (!foundEx) {
            foundEx = await prisma.exercise.create({
              data: {
                name: item.name,
                slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                category: 'Strength',
                muscleGroup: item.muscleGroup || 'Full Body',
                equipment: item.equipment || 'Gym',
                difficulty: 'Intermediate',
                instructions: item.notes || 'Perform with controlled tempo and solid bracing.',
              },
            });
          }
          exerciseId = foundEx.id;
        }

        if (exerciseId) {
          await prisma.workoutPlanExercise.create({
            data: {
              workoutPlanId: plan.id,
              exerciseId,
              dayOfWeek: item.dayOfWeek || 1,
              order: item.order || i + 1,
              targetSets: item.targetSets || 3,
              targetReps: String(item.targetReps || '8-12'),
              restSeconds: item.restSeconds || 60,
            },
          });
        }
      }
    }

    const completePlan = await prisma.workoutPlan.findUnique({
      where: { id: plan.id },
      include: {
        exercises: { include: { exercise: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Workout plan created!', data: completePlan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create workout plan.', error: error.message });
  }
};

export const updateWorkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, description, category, difficulty, durationWeeks, daysPerWeek } = req.body;

    const existing = await prisma.workoutPlan.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(403).json({ success: false, message: 'Cannot edit this workout plan.' });
      return;
    }

    const updated = await prisma.workoutPlan.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        category: category !== undefined ? category : undefined,
        difficulty: difficulty !== undefined ? difficulty : undefined,
        durationWeeks: durationWeeks !== undefined ? Number(durationWeeks) : undefined,
        daysPerWeek: daysPerWeek !== undefined ? Number(daysPerWeek) : undefined,
      },
    });

    res.status(200).json({ success: true, message: 'Workout plan updated.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update plan.', error: error.message });
  }
};

export const deleteWorkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.workoutPlan.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(403).json({ success: false, message: 'Cannot delete this plan.' });
      return;
    }

    await prisma.workoutPlan.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Workout plan deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete plan.' });
  }
};

export const startWorkoutSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { planId, dayNumber, customTitle } = req.body;

    // Check if there is already an in_progress session
    const existingActive = await prisma.workoutSession.findFirst({
      where: { userId, status: 'in_progress' },
      include: {
        sessionExercises: {
          include: { exercise: true, sets: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (existingActive) {
      res.status(200).json({
        success: true,
        message: 'Resuming active workout session.',
        data: existingActive,
      });
      return;
    }

    let sessionTitle = customTitle || 'Open Training Session';
    let targetExercises: Array<{ exerciseId: string; sets: number; reps: string; restSeconds: number }> = [];

    if (planId) {
      const plan = await prisma.workoutPlan.findUnique({
        where: { id: planId },
        include: {
          exercises: {
            where: dayNumber ? { dayOfWeek: Number(dayNumber) } : undefined,
            include: { exercise: true },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (plan) {
        sessionTitle = `${plan.title}${dayNumber ? ` - Day ${dayNumber}` : ''}`;
        targetExercises = plan.exercises.map((pe) => ({
          exerciseId: pe.exerciseId,
          sets: pe.targetSets,
          reps: pe.targetReps,
          restSeconds: pe.restSeconds,
        }));
      }
    }

    const session = await prisma.workoutSession.create({
      data: {
        userId,
        planId: planId || null,
        title: sessionTitle,
        status: 'in_progress',
        startedAt: new Date(),
      },
    });

    // Populate exercises & sets
    for (let i = 0; i < targetExercises.length; i++) {
      const item = targetExercises[i];
      const workoutEx = await prisma.workoutExercise.create({
        data: {
          workoutSessionId: session.id,
          exerciseId: item.exerciseId,
          order: i + 1,
        },
      });

      const setCount = Math.max(1, item.sets || 3);
      for (let s = 1; s <= setCount; s++) {
        await prisma.exerciseSet.create({
          data: {
            workoutExerciseId: workoutEx.id,
            setNumber: s,
            targetReps: parseInt(item.reps) || 10,
            actualReps: parseInt(item.reps) || 10,
            weightKg: 0,
            completed: false,
          },
        });
      }
    }

    const fullSession = await prisma.workoutSession.findUnique({
      where: { id: session.id },
      include: {
        sessionExercises: {
          include: { exercise: true, sets: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(201).json({ success: true, message: 'Workout session started!', data: fullSession });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to start session.', error: error.message });
  }
};

export const getActiveSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const session = await prisma.workoutSession.findFirst({
      where: { userId, status: 'in_progress' },
      include: {
        sessionExercises: {
          include: { exercise: true, sets: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(200).json({ success: true, data: session || null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve active session.' });
  }
};

export const updateSet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { setId } = req.params;
    const { actualReps, weightKg, completed, rpe } = req.body;

    const updated = await prisma.exerciseSet.update({
      where: { id: setId },
      data: {
        actualReps: actualReps !== undefined ? Number(actualReps) : undefined,
        weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
        completed: completed !== undefined ? Boolean(completed) : undefined,
        rpe: rpe !== undefined ? Number(rpe) : undefined,
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update set.' });
  }
};

export const addExerciseToSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { exerciseId } = req.body;

    const count = await prisma.workoutExercise.count({ where: { workoutSessionId: sessionId } });

    const workoutEx = await prisma.workoutExercise.create({
      data: {
        workoutSessionId: sessionId,
        exerciseId,
        order: count + 1,
      },
    });

    // Create 3 default sets
    for (let s = 1; s <= 3; s++) {
      await prisma.exerciseSet.create({
        data: {
          workoutExerciseId: workoutEx.id,
          setNumber: s,
          targetReps: 10,
          actualReps: 10,
          weightKg: 0,
          completed: false,
        },
      });
    }

    const fullEx = await prisma.workoutExercise.findUnique({
      where: { id: workoutEx.id },
      include: { exercise: true, sets: true },
    });

    res.status(201).json({ success: true, data: fullEx });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add exercise to session.' });
  }
};

export const addSetToExercise = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workoutExerciseId } = req.body;
    const count = await prisma.exerciseSet.count({ where: { workoutExerciseId } });

    const newSet = await prisma.exerciseSet.create({
      data: {
        workoutExerciseId,
        setNumber: count + 1,
        targetReps: 10,
        actualReps: 10,
        weightKg: 0,
        completed: false,
      },
    });

    res.status(201).json({ success: true, data: newSet });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add set.' });
  }
};

export const completeWorkoutSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { notes, durationSeconds } = req.body;

    const session = await prisma.workoutSession.findUnique({
      where: { id },
      include: {
        sessionExercises: {
          include: { sets: true },
        },
      },
    });

    if (!session || session.userId !== userId) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }

    // Calculate total volume lifted
    let totalVolumeKg = 0;
    let completedSetsCount = 0;

    session.sessionExercises.forEach((se) => {
      se.sets.forEach((s) => {
        if (s.completed) {
          totalVolumeKg += (s.weightKg || 0) * (s.actualReps || 0);
          completedSetsCount++;
        }
      });
    });

    const elapsed = Number(durationSeconds) || session.durationSeconds || 2400; // ~40 mins default
    // Approximate calories burned: ~7-10 kcal per minute of lifting
    const caloriesBurned = Math.round((elapsed / 60) * 8.5);

    const updated = await prisma.workoutSession.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        durationSeconds: elapsed,
        totalVolumeKg: Math.round(totalVolumeKg),
        caloriesBurned,
        notes: notes || session.notes,
      },
    });

    // Create achievement notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Workout Completed! 🏆',
        message: `Great job! You burned ${caloriesBurned} kcal and lifted ${Math.round(totalVolumeKg)} kg total volume across ${completedSetsCount} sets.`,
        type: 'ACHIEVEMENT',
      },
    });

    // Update consistency goal if active
    const consistencyGoal = await prisma.fitnessGoal.findFirst({
      where: { userId, status: 'active', category: 'Consistency' },
    });
    if (consistencyGoal) {
      const nextVal = consistencyGoal.currentValue + 1;
      await prisma.fitnessGoal.update({
        where: { id: consistencyGoal.id },
        data: {
          currentValue: nextVal,
          status: nextVal >= consistencyGoal.targetValue ? 'completed' : 'active',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workout session successfully recorded!',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to complete session.', error: error.message });
  }
};

export const getExercises = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { muscleGroup, equipment, difficulty, category, search } = req.query;

    const whereClause: any = {};
    if (muscleGroup) whereClause.muscleGroup = String(muscleGroup);
    if (equipment) whereClause.equipment = String(equipment);
    if (difficulty) whereClause.difficulty = String(difficulty);
    if (category) whereClause.category = String(category);
    if (search) {
      whereClause.name = { contains: String(search) };
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    res.status(200).json({ success: true, count: exercises.length, data: exercises });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch exercise library.' });
  }
};

export const getSessionHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const history = await prisma.workoutSession.findMany({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      include: {
        sessionExercises: {
          include: { exercise: true, sets: true },
        },
      },
    });

    res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch workout history.' });
  }
};
