import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { sendWelcomeEmail } from './emailService';
import logger from '../utils/logger';
import { RegisterInput, LoginInput } from '../utils/validation';

export class AuthService {
  async register(data: RegisterInput) {
    const { email, password, name } = data;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email já cadastrado');
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
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async login(data: LoginInput) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return {
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
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async updateProfile(userId: string, data: any) {
    const { name, bio, avatar, phone } = data;

    logger.info('Atualizando perfil', { userId, name, hasAvatar: !!avatar, phone });

    const user = await prisma.user.update({
      where: { id: userId },
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

    logger.info('Perfil atualizado com sucesso', { userId: user.id, hasAvatar: !!user.avatar });

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new Error('Senha atual incorreta');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info('Senha alterada com sucesso', { userId });
    return { message: 'Senha alterada com sucesso' };
  }

  async getPublicProfile(userId: string) {
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
      throw new Error('Usuário não encontrado');
    }

    // Buscar dados de gamificação
    const gamification = await prisma.gamification.findUnique({
      where: { userId },
    });

    // Buscar progresso
    const progress = await prisma.progress.findUnique({
      where: { userId },
    });

    return {
      user,
      gamification: gamification || null,
      progress: progress || null,
    };
  }
}

export default new AuthService();
