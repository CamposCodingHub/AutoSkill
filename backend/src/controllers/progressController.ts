import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const getProgress = async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.progress.findUnique({
      where: { userId: req.userId! },
    });

    if (!progress) {
      logger.warn('Progresso não encontrado', { userId: req.userId });
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }

    res.json(progress);
  } catch (error) {
    logger.error('Erro ao buscar progresso', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao buscar progresso' });
  }
};

export const updateLessonProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { moduleId, lessonId } = req.params;
    const { completed } = req.body;

    const progress = await prisma.progress.findUnique({
      where: { userId: req.userId! },
    });

    if (!progress) {
      logger.warn('Progresso não encontrado em updateLessonProgress', { userId: req.userId });
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }

    const key = `${moduleId}-${lessonId}`;
    const updatedCompletedLessons = {
      ...progress.completedLessons as any,
      [key]: completed,
    };

    const updatedProgress = await prisma.progress.update({
      where: { userId: req.userId! },
      data: {
        completedLessons: updatedCompletedLessons,
      },
    });

    res.json(updatedProgress);
  } catch (error) {
    logger.error('Erro ao atualizar progresso', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao atualizar progresso' });
  }
};

export const saveQuizAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { moduleId, lessonId, answerIndex, correctIndex, totalQuizzes } = req.body;

    const progress = await prisma.progress.findUnique({
      where: { userId: req.userId! },
    });

    if (!progress) {
      logger.warn('Progresso não encontrado em saveQuizAnswer', { userId: req.userId });
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }

    const key = `${moduleId}-${lessonId}`;
    const quizKey = `${moduleId}-${lessonId}-quiz`;

    // Atualizar quizAnswers
    const updatedQuizAnswers = {
      ...progress.quizAnswers as any,
      [quizKey]: answerIndex,
    };

    // Atualizar lessonQuizProgress
    const currentProgress = (progress.lessonQuizProgress as any)[key] || { answered: 0, correct: 0, total: totalQuizzes };
    const isCorrect = answerIndex === correctIndex;
    const newProgress = {
      answered: currentProgress.answered + 1,
      correct: currentProgress.correct + (isCorrect ? 1 : 0),
      total: totalQuizzes,
    };

    const updatedLessonQuizProgress = {
      ...progress.lessonQuizProgress as any,
      [key]: newProgress,
    };

    // Verificar se aula está completa
    const isFullyCompleted = newProgress.answered === newProgress.total;
    const updatedCompletedLessons = {
      ...progress.completedLessons as any,
    };

    if (isFullyCompleted && !updatedCompletedLessons[key]) {
      updatedCompletedLessons[key] = true;
    }

    const updatedProgress = await prisma.progress.update({
      where: { userId: req.userId! },
      data: {
        quizAnswers: updatedQuizAnswers,
        lessonQuizProgress: updatedLessonQuizProgress,
        completedLessons: updatedCompletedLessons,
      },
    });

    res.json(updatedProgress);
  } catch (error) {
    logger.error('Erro ao salvar resposta do quiz', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao salvar resposta do quiz' });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const leaderboard = await prisma.gamification.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        totalXP: 'desc',
      },
      take: 10,
    });

    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user.id,
      userName: entry.user.name,
      xp: entry.totalXP,
      level: entry.currentLevel,
      streak: entry.streak,
    }));

    res.json(formattedLeaderboard);
  } catch (error) {
    logger.error('Erro ao buscar leaderboard', { error });
    res.status(500).json({ error: 'Erro ao buscar leaderboard' });
  }
};
