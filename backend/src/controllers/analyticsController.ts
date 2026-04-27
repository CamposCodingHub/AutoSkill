import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const getAdvancedAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const users = await prisma.user.findMany({
      include: {
        progress: true,
        gamification: true,
        portfolios: true,
        mentorMentorships: true,
        menteeMentorships: true,
        certifications: true,
      },
    });

    // Métricas agregadas
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.progress.length > 0).length;
    const totalProgress = users.reduce((acc, u) => acc + u.progress.length, 0);
    const avgProgressPerUser = totalUsers > 0 ? totalProgress / totalUsers : 0;

    // Crescimento de usuários por mês
    const growthByMonth = users.reduce((acc, user) => {
      const month = new Date(user.createdAt).toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Gamificação por usuário
    const gamificationByUser = users.map(user => {
      const gam = user.gamification[0];
      return {
        userId: user.id,
        userName: user.name,
        totalXP: gam?.totalXP || 0,
        currentLevel: gam?.currentLevel || 1,
        streak: gam?.streak || 0,
        achievements: gam?.achievements?.length || 0,
      };
    });

    // Portfólios por usuário
    const portfoliosByUser = users.map(user => ({
      userId: user.id,
      userName: user.name,
      totalPortfolios: user.portfolios.length,
      publishedPortfolios: user.portfolios.filter(p => p.status === 'published').length,
    }));

    // Mentorias por usuário
    const mentorshipsByUser = users.map(user => ({
      userId: user.id,
      userName: user.name,
      asMentor: user.mentorMentorships.length,
      asMentee: user.menteeMentorships.length,
    }));

    // Certificações por usuário
    const certificationsByUser = users.map(user => ({
      userId: user.id,
      userName: user.name,
      totalCertifications: user.certifications.length,
      completedCertifications: user.certifications.filter(c => c.status === 'completed').length,
    }));

    // Distribuição de níveis de gamificação
    const levelDistribution = gamificationByUser.reduce((acc, g) => {
      acc[g.currentLevel] = (acc[g.currentLevel] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalProgress,
        avgProgressPerUser: Math.round(avgProgressPerUser * 100) / 100,
      },
      users,
      growthByMonth,
      gamificationByUser,
      portfoliosByUser,
      mentorshipsByUser,
      certificationsByUser,
      levelDistribution,
    });
  } catch (error) {
    logger.error('Error fetching advanced analytics', { error });
    res.status(500).json({ error: 'Erro ao buscar analytics avançado' });
  }
};

export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: true,
        gamification: true,
        portfolios: true,
        mentorMentorships: true,
        menteeMentorships: true,
        certifications: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Análise de progresso
    const progressData = user.progress[0];
    const completedLessons = progressData?.completedLessons ? Object.keys(progressData.completedLessons).length : 0;
    const quizProgress = progressData?.lessonQuizProgress ? Object.values(progressData.lessonQuizProgress) : [];

    // Análise de quizzes
    const quizStats = quizProgress.reduce((acc: any, quiz: any) => {
      acc.totalAnswered += quiz.answered || 0;
      acc.totalCorrect += quiz.correct || 0;
      acc.totalQuestions += quiz.total || 0;
      return acc;
    }, { totalAnswered: 0, totalCorrect: 0, totalQuestions: 0 });

    const quizAccuracy = quizStats.totalQuestions > 0 
      ? Math.round((quizStats.totalCorrect / quizStats.totalQuestions) * 100) 
      : 0;

    // Gamificação
    const gam = user.gamification[0];
    const gamificationStats = {
      totalXP: gam?.totalXP || 0,
      currentLevel: gam?.currentLevel || 1,
      levelProgress: gam?.levelProgress || 0,
      streak: gam?.streak || 0,
      longestStreak: gam?.longestStreak || 0,
      achievements: gam?.achievements || [],
      weeklyXP: gam?.weeklyXP || 0,
      monthlyXP: gam?.monthlyXP || 0,
      lastStudyDate: gam?.lastStudyDate,
      studyHistory: gam?.studyHistory || [],
    };

    // Timeline de estudo
    const studyTimeline = gam?.studyHistory?.map((date: Date) => ({
      date: new Date(date),
      type: 'study',
    })) || [];

    // Portfólios
    const portfolioStats = {
      total: user.portfolios.length,
      published: user.portfolios.filter(p => p.status === 'published').length,
      draft: user.portfolios.filter(p => p.status === 'draft').length,
      byDifficulty: user.portfolios.reduce((acc, p) => {
        acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Mentorias
    const mentorshipStats = {
      asMentor: user.mentorMentorships.length,
      asMentee: user.menteeMentorships.length,
      activeAsMentor: user.mentorMentorships.filter(m => m.status === 'active').length,
      activeAsMentee: user.menteeMentorships.filter(m => m.status === 'active').length,
    };

    // Certificações
    const certificationStats = {
      total: user.certifications.length,
      completed: user.certifications.filter(c => c.status === 'completed').length,
      inProgress: user.certifications.filter(c => c.status === 'in_progress').length,
      eligible: user.certifications.filter(c => c.status === 'eligible').length,
    };

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      progress: {
        completedLessons,
        quizStats,
        quizAccuracy,
      },
      gamification: gamificationStats,
      studyTimeline,
      portfolios: portfolioStats,
      mentorships: mentorshipStats,
      certifications: certificationStats,
    });
  } catch (error) {
    logger.error('Error fetching user analytics', { error });
    res.status(500).json({ error: 'Erro ao buscar analytics do usuário' });
  }
};
