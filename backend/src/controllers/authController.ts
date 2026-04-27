import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { sendWelcomeEmail } from '../services/emailService';
import { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema, 
  changePasswordSchema 
} from '../utils/validation';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  try {
    // Validar entrada
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name } = validatedData;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Criar progresso inicial
    await prisma.progress.create({
      data: {
        userId: user.id,
        completedLessons: {},
        quizAnswers: {},
        lessonQuizProgress: {},
      },
    });

    // Criar gamificação inicial
    await prisma.gamification.create({
      data: {
        userId: user.id,
        totalXP: 0,
        currentLevel: 1,
        levelProgress: 0,
        streak: 0,
        longestStreak: 0,
        achievements: [],
        weeklyXP: 0,
        monthlyXP: 0,
        studyHistory: [],
        streakFreezeAvailable: false,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    // Enviar email de boas-vindas
    try {
      logger.info('Enviando email de boas-vindas', { email: user.email, name: user.name });
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      logger.error('Erro ao enviar email de boas-vindas', { error: emailError, email: user.email });
      // Não falhar o registro se o email falhar
    }

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('Dados de entrada inválidos no registro', { error });
      return res.status(400).json({ error: 'Dados de entrada inválidos' });
    }
    logger.error('Erro ao registrar usuário', { error });
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

export const login = async (req: any, res: Response) => {
  try {
    // Validar entrada
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn('Tentativa de login com email não cadastrado', { email });
      return res.status(401).json({ error: 'Email não cadastrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logger.warn('Tentativa de login com senha incorreta', { email });
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    // Criar log de auditoria para login
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          entity: 'User',
          entityId: user.id,
          details: { email: user.email },
          ipAddress: req.ip || req.socket?.remoteAddress,
          userAgent: req.headers?.['user-agent'],
        },
      });
    } catch (logError) {
      logger.error('Erro ao criar log de login', { error: logError, userId: user.id });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('Dados de entrada inválidos no login', { error });
      return res.status(400).json({ error: 'Dados de entrada inválidos' });
    }
    logger.error('Erro ao fazer login', { error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
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

    if (!user) {
      logger.warn('Usuário não encontrado em getMe', { userId: req.userId });
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Erro ao buscar usuário', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, bio, avatar, phone } = req.body;

    logger.info('Atualizando perfil', { userId: req.userId, name, hasAvatar: !!avatar, avatarLength: avatar?.length, phone });

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name,
        bio,
        avatar,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatar: true,
        phone: true,
      },
    });

    logger.info('Perfil atualizado com sucesso', { userId: user.id, hasAvatar: !!user.avatar, avatarLength: user.avatar?.length });

    res.json(user);
  } catch (error) {
    logger.error('Erro ao atualizar perfil', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      logger.warn('Usuário não encontrado em changePassword', { userId: req.userId });
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      logger.warn('Senha atual incorreta', { userId: req.userId });
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword },
    });

    logger.info('Senha alterada com sucesso', { userId: req.userId });
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    logger.error('Erro ao alterar senha', { error, userId: req.userId });
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

// Buscar perfil público de um usuário
export const getPublicProfile = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      logger.warn('Perfil público não encontrado', { userId });
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar dados de gamificação
    const gamification = await prisma.gamification.findUnique({
      where: { userId },
    });

    // Buscar progresso
    const progress = await prisma.progress.findUnique({
      where: { userId },
    });

    res.json({
      user,
      gamification: gamification || null,
      progress: progress || null,
    });
  } catch (error) {
    logger.error('Erro ao buscar perfil público', { error, userId: req.params.userId });
    res.status(500).json({ error: 'Erro ao buscar perfil público' });
  }
};

export const resetAdmin = async (req: Request, res: Response) => {
  // Desabilitar este endpoint em produção por segurança
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not Found' });
  }

  try {
    const { email, password, name } = req.body;

    const adminEmail = email || 'admin@autoskill.com';
    const adminPassword = password || 'admin123';
    const adminName = name || 'Administrador';

    // Buscar usuário existente
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      // Resetar senha
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'admin',
          name: adminName
        }
      });
      logger.warn('Admin resetado', { email: adminEmail });
      res.json({ message: 'Admin resetado com sucesso', email: adminEmail, password: adminPassword });
    } else {
      // Criar novo admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const newAdmin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: 'admin'
        }
      });

      // Criar progresso inicial
      await prisma.progress.create({
        data: {
          userId: newAdmin.id,
          completedLessons: {},
          quizAnswers: {},
          lessonQuizProgress: {},
        },
      });

      // Criar gamificação inicial
      await prisma.gamification.create({
        data: {
          userId: newAdmin.id,
          totalXP: 0,
          currentLevel: 1,
          levelProgress: 0,
          streak: 0,
          longestStreak: 0,
          achievements: [],
          weeklyXP: 0,
          monthlyXP: 0,
        },
      });

      logger.info('Admin criado', { email: adminEmail });
      res.json({ message: 'Admin criado com sucesso', email: adminEmail, password: adminPassword });
    }
  } catch (error) {
    logger.error('Erro ao resetar admin', { error });
    res.status(500).json({ error: 'Erro ao resetar admin' });
  }
};
