import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

// Função helper para criar logs de auditoria
const createAuditLog = async (
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: any,
  req?: any
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress: req?.ip || req?.socket?.remoteAddress,
        userAgent: req?.headers?.['user-agent'],
      },
    });
  } catch (error) {
    logger.error('Erro ao criar log de auditoria', { error, userId, action, entity });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          bio: true,
          avatar: true,
          phone: true,
          createdAt: true,
          _count: {
            select: {
              progress: true,
              gamification: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Erro ao buscar usuários', { error });
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Não permitir deletar o próprio usuário
    if (userId === req.userId) {
      logger.warn('Tentativa de deletar próprio usuário', { userId });
      return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
    }

    const deletedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    // Criar log de auditoria
    if (req.userId) {
      await createAuditLog(
        req.userId,
        'DELETE',
        'User',
        userId,
        { deletedUserEmail: deletedUser?.email, deletedUserName: deletedUser?.name },
        req
      );
    }

    logger.info('Usuário deletado', { deletedUserId: userId, deletedBy: req.userId });
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar usuário', { error, userId: req.params.userId });
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      logger.warn('Role inválido fornecido', { userId, role });
      return res.status(400).json({ error: 'Role inválido' });
    }

    // Não permitir alterar o próprio role
    if (userId === req.userId) {
      logger.warn('Tentativa de alterar próprio role', { userId });
      return res.status(400).json({ error: 'Não é possível alterar seu próprio role' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Criar log de auditoria
    if (req.userId) {
      await createAuditLog(
        req.userId,
        'UPDATE',
        'User',
        userId,
        { field: 'role', oldValue: user.role, newValue: role },
        req
      );
    }

    logger.info('Role de usuário atualizado', { userId, newRole: role, updatedBy: req.userId });
    res.json(user);
  } catch (error) {
    logger.error('Erro ao atualizar role', { error, userId: req.params.userId });
    res.status(500).json({ error: 'Erro ao atualizar role' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, role, bio, avatar, phone, password } = req.body;

    logger.info('Atualizando usuário', { userId, name, role, hasBio: !!bio, hasAvatar: !!avatar, hasPhone: !!phone, hasPassword: !!password });

    if (role && !['admin', 'user'].includes(role)) {
      logger.warn('Role inválido fornecido', { userId, role });
      return res.status(400).json({ error: 'Role inválido' });
    }

    const updateData: any = {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(avatar !== undefined && { avatar }),
      ...(phone !== undefined && { phone }),
    };

    // Só permite alterar role se não for o próprio usuário
    if (role && userId !== req.userId) {
      updateData.role = role;
    }

    // Se senha foi fornecida, hash e atualiza
    if (password && password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    logger.debug('Dados para atualizar', { keys: Object.keys(updateData) });

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
    });

    // Criar log de auditoria
    if (req.userId) {
      await createAuditLog(
        req.userId,
        'UPDATE',
        'User',
        userId,
        { fields: Object.keys(updateData) },
        req
      );
    }

    logger.info('Usuário atualizado com sucesso', { userId, updatedBy: req.userId });
    res.json(user);
  } catch (error) {
    logger.error('Erro ao atualizar usuário', { error, userId: req.params.userId });
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};
