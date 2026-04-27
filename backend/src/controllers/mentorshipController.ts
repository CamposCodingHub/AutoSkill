import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const createMentorshipRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { mentorId, goals } = req.body;

    // Verificar se já existe uma mentoria entre esses usuários
    const existing = await prisma.mentorship.findUnique({
      where: {
        mentorId_menteeId: {
          mentorId,
          menteeId: req.userId!,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Já existe uma mentoria entre estes usuários' });
    }

    const mentorship = await prisma.mentorship.create({
      data: {
        mentorId,
        menteeId: req.userId!,
        status: 'pending',
        goals: goals || [],
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    logger.info('Solicitação de mentoria criada', { mentorshipId: mentorship.id, menteeId: req.userId });
    res.status(201).json(mentorship);
  } catch (error) {
    logger.error('Erro ao criar solicitação de mentoria', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao criar solicitação de mentoria' });
  }
};

export const getMentorshipRequests = async (req: AuthRequest, res: Response) => {
  try {
    // Buscar solicitações onde o usuário é o mentor
    const requests = await prisma.mentorship.findMany({
      where: {
        mentorId: req.userId!,
        status: 'pending',
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(requests);
  } catch (error) {
    logger.error('Erro ao buscar solicitações de mentoria', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao buscar solicitações de mentoria' });
  }
};

export const getMyMentorships = async (req: AuthRequest, res: Response) => {
  try {
    // Buscar mentorias onde o usuário é mentor ou mentee
    const mentorships = await prisma.mentorship.findMany({
      where: {
        OR: [
          { mentorId: req.userId! },
          { menteeId: req.userId! },
        ],
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(mentorships);
  } catch (error) {
    logger.error('Erro ao buscar minhas mentorias', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao buscar minhas mentorias' });
  }
};

export const acceptMentorship = async (req: AuthRequest, res: Response) => {
  try {
    const { mentorshipId } = req.params;

    const mentorship = await prisma.mentorship.findUnique({
      where: { id: mentorshipId },
    });

    if (!mentorship || mentorship.mentorId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (mentorship.status !== 'pending') {
      return res.status(400).json({ error: 'Esta mentoria não está pendente' });
    }

    const updated = await prisma.mentorship.update({
      where: { id: mentorshipId },
      data: {
        status: 'active',
        startedAt: new Date(),
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    logger.info('Mentoria aceita', { mentorshipId, mentorId: req.userId });
    res.json(updated);
  } catch (error) {
    logger.error('Erro ao aceitar mentoria', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao aceitar mentoria' });
  }
};

export const rejectMentorship = async (req: AuthRequest, res: Response) => {
  try {
    const { mentorshipId } = req.params;

    const mentorship = await prisma.mentorship.findUnique({
      where: { id: mentorshipId },
    });

    if (!mentorship || mentorship.mentorId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (mentorship.status !== 'pending') {
      return res.status(400).json({ error: 'Esta mentoria não está pendente' });
    }

    await prisma.mentorship.update({
      where: { id: mentorshipId },
      data: {
        status: 'cancelled',
      },
    });

    logger.info('Mentoria rejeitada', { mentorshipId, mentorId: req.userId });
    res.json({ message: 'Mentoria rejeitada com sucesso' });
  } catch (error) {
    logger.error('Erro ao rejeitar mentoria', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao rejeitar mentoria' });
  }
};

export const completeMentorship = async (req: AuthRequest, res: Response) => {
  try {
    const { mentorshipId } = req.params;
    const { notes } = req.body;

    const mentorship = await prisma.mentorship.findUnique({
      where: { id: mentorshipId },
    });

    if (!mentorship || mentorship.mentorId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (mentorship.status !== 'active') {
      return res.status(400).json({ error: 'Esta mentoria não está ativa' });
    }

    const updated = await prisma.mentorship.update({
      where: { id: mentorshipId },
      data: {
        status: 'completed',
        endedAt: new Date(),
        notes: notes || null,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    logger.info('Mentoria completada', { mentorshipId, mentorId: req.userId });
    res.json(updated);
  } catch (error) {
    logger.error('Erro ao completar mentoria', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao completar mentoria' });
  }
};

export const getAvailableMentors = async (req: AuthRequest, res: Response) => {
  try {
    // Buscar usuários com role 'admin' ou com certificações completas
    const mentors = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          {
            certifications: {
              some: {
                status: 'completed',
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        certifications: {
          where: {
            status: 'completed',
          },
          include: {
            certification: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Contar mentorias ativas de cada mentor
    const mentorsWithCount = await Promise.all(
      mentors.map(async (mentor) => {
        const activeCount = await prisma.mentorship.count({
          where: {
            mentorId: mentor.id,
            status: 'active',
          },
        });
        return {
          ...mentor,
          activeMentorships: activeCount,
        };
      })
    );

    res.json(mentorsWithCount);
  } catch (error) {
    logger.error('Erro ao buscar mentores disponíveis', { error });
    res.status(500).json({ error: 'Erro ao buscar mentores disponíveis' });
  }
};
