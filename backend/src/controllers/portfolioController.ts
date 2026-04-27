import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const createPortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, projectType, images, skills, difficulty } = req.body;

    const portfolio = await prisma.portfolio.create({
      data: {
        userId: req.userId!,
        title,
        description,
        projectType,
        images: images || [],
        skills: skills || [],
        difficulty,
        status: 'draft',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    logger.info('Portfólio criado', { portfolioId: portfolio.id, userId: req.userId });
    res.status(201).json(portfolio);
  } catch (error) {
    logger.error('Erro ao criar portfólio', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao criar portfólio' });
  }
};

export const getPortfolios = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const userId = req.query.userId as string;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    else where.status = 'published'; // Por padrão, mostrar apenas publicados

    const [portfolios, total] = await Promise.all([
      prisma.portfolio.findMany({
        where,
        include: {
          user: {
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
        skip,
        take: limit,
      }),
      prisma.portfolio.count({ where }),
    ]);

    res.json({
      portfolios,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Erro ao buscar portfólios', { error });
    res.status(500).json({ error: 'Erro ao buscar portfólios' });
  }
};

export const getMyPortfolios = async (req: AuthRequest, res: Response) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId: req.userId!,
      },
      include: {
        user: {
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

    res.json(portfolios);
  } catch (error) {
    logger.error('Erro ao buscar meus portfólios', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao buscar meus portfólios' });
  }
};

export const updatePortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const { portfolioId } = req.params;
    const { title, description, projectType, images, skills, difficulty, status } = req.body;

    // Verificar se o portfólio pertence ao usuário
    const existing = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!existing || existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const portfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(projectType && { projectType }),
        ...(images && { images }),
        ...(skills && { skills }),
        ...(difficulty && { difficulty }),
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    logger.info('Portfólio atualizado', { portfolioId, userId: req.userId });
    res.json(portfolio);
  } catch (error) {
    logger.error('Erro ao atualizar portfólio', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao atualizar portfólio' });
  }
};

export const deletePortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const { portfolioId } = req.params;

    // Verificar se o portfólio pertence ao usuário
    const existing = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!existing || existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.portfolio.delete({
      where: { id: portfolioId },
    });

    logger.info('Portfólio deletado', { portfolioId, userId: req.userId });
    res.json({ message: 'Portfólio deletado com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar portfólio', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao deletar portfólio' });
  }
};

export const likePortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const { portfolioId } = req.params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfólio não encontrado' });
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        likes: portfolio.likes + 1,
      },
    });

    res.json({ likes: updatedPortfolio.likes });
  } catch (error) {
    logger.error('Erro ao curtir portfólio', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao curtir portfólio' });
  }
};
