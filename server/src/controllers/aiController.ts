import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';
import { AiService } from '../services/aiService';

export const generateWorkoutPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { prompt, daysPerWeek, focus, difficulty } = req.body;

    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    const userContext = {
      age: profile?.age,
      gender: profile?.gender,
      weight: profile?.weight,
      height: profile?.height,
      fitnessLevel: difficulty || profile?.fitnessLevel,
      primaryGoal: focus || profile?.primaryGoal,
      equipment: profile?.equipment,
      workoutDaysPerWeek: daysPerWeek ? Number(daysPerWeek) : profile?.workoutDaysPerWeek,
      dietaryPreference: profile?.dietaryPreference,
    };

    const aiPlan = await AiService.generateWorkoutPlan(userContext, prompt);

    res.status(200).json({
      success: true,
      data: aiPlan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'AI Plan generation failed.', error: error.message });
  }
};

export const getNutritionAdvice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { targetCalories } = req.body;

    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    const userContext = {
      age: profile?.age,
      gender: profile?.gender,
      weight: profile?.weight,
      height: profile?.height,
      fitnessLevel: profile?.fitnessLevel,
      primaryGoal: profile?.primaryGoal,
      dietaryPreference: profile?.dietaryPreference,
    };

    const advice = await AiService.getNutritionAdvice(
      userContext,
      targetCalories ? Number(targetCalories) : profile?.dailyCalorieTarget || undefined
    );

    res.status(200).json({
      success: true,
      data: advice,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve AI nutrition advice.' });
  }
};

export const chatWithAi = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message text is required.' });
      return;
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    // Store user message
    await prisma.aiChatMessage.create({
      data: {
        userId,
        role: 'user',
        content: message.trim(),
      },
    });

    // Fetch conversation history
    const history = await prisma.aiChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    history.reverse();

    const userContext = {
      age: profile?.age,
      gender: profile?.gender,
      weight: profile?.weight,
      height: profile?.height,
      fitnessLevel: profile?.fitnessLevel,
      primaryGoal: profile?.primaryGoal,
      dietaryPreference: profile?.dietaryPreference,
    };

    const reply = await AiService.chatResponse(message, history, userContext);

    // Save assistant reply
    const assistantMessage = await prisma.aiChatMessage.create({
      data: {
        userId,
        role: 'assistant',
        content: reply.text,
        metadata: reply.actionCard ? JSON.stringify(reply.actionCard) : null,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        id: assistantMessage.id,
        role: 'assistant',
        content: reply.text,
        actionCard: reply.actionCard,
        disclaimer: reply.disclaimer,
        createdAt: assistantMessage.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Chat generation failed.', error: error.message });
  }
};

export const getChatHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const messages = await prisma.aiChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      actionCard: m.metadata ? JSON.parse(m.metadata) : undefined,
      createdAt: m.createdAt,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve chat history.' });
  }
};
