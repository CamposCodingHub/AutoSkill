import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Criar log de auditoria
export const createAuditLog = async (req: Request, res: Response) => {
  try {
    const { userId, action, entity, entityId, details } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        userAgent,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json(auditLog);
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
    res.status(500).json({ error: 'Erro ao criar log de auditoria' });
  }
};

// Listar logs de auditoria
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;

    const where: any = {};
    if (role && role !== 'all') {
      where.user = {
        role: role as string,
      };
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.auditLog.count({ where });

    res.json({
      logs,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
  }
};

// Buscar log por ID
export const getAuditLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    res.json(log);
  } catch (error) {
    console.error('Erro ao buscar log de auditoria:', error);
    res.status(500).json({ error: 'Erro ao buscar log de auditoria' });
  }
};
