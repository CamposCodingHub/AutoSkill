import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getGamificationProfile = async (req: AuthRequest, res: Response) => {
  try {
    const gamification = await prisma.gamification.findUnique({
      where: { userId: req.userId! },
    });

    if (!gamification) {
      return res.status(404).json({ error: 'Perfil de gamificação não encontrado' });
    }

    res.json(gamification);
  } catch (error) {
    console.error('Erro ao buscar perfil de gamificação:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil de gamificação' });
  }
};

export const updateGamificationProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { totalXP, currentLevel, levelProgress, streak, longestStreak, achievements, weeklyXP, monthlyXP, lastStudyDate, studyHistory, streakFreezeAvailable } = req.body;

    const gamification = await prisma.gamification.upsert({
      where: { userId: req.userId! },
      update: {
        totalXP,
        currentLevel,
        levelProgress,
        streak,
        longestStreak,
        achievements,
        weeklyXP,
        monthlyXP,
        lastStudyDate: lastStudyDate ? new Date(lastStudyDate) : null,
        studyHistory: studyHistory ? studyHistory.map((d: any) => new Date(d)) : [],
        streakFreezeAvailable,
      },
      create: {
        userId: req.userId!,
        totalXP: totalXP || 0,
        currentLevel: currentLevel || 1,
        levelProgress: levelProgress || 0,
        streak: streak || 0,
        longestStreak: longestStreak || 0,
        achievements: achievements || [],
        weeklyXP: weeklyXP || 0,
        monthlyXP: monthlyXP || 0,
        lastStudyDate: lastStudyDate ? new Date(lastStudyDate) : null,
        studyHistory: studyHistory ? studyHistory.map((d: any) => new Date(d)) : [],
        streakFreezeAvailable: streakFreezeAvailable || false,
      },
    });

    res.json(gamification);
  } catch (error) {
    console.error('Erro ao atualizar perfil de gamificação:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil de gamificação' });
  }
};
