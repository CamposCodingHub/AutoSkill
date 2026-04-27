import { z } from 'zod';

// Schema de validação para registro
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter letra maiúscula, minúscula e número'),
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
});

// Schema de validação para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// Schema de validação para atualização de perfil
export const updateProfileSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().optional()
});

// Schema de validação para alteração de senha
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Nova senha deve conter letra maiúscula, minúscula e número')
});

// Schema de validação para progresso de aula
export const lessonProgressSchema = z.object({
  moduleId: z.string().min(1),
  lessonId: z.string().min(1),
  completed: z.boolean()
});

// Schema de validação para quiz
export const quizSchema = z.object({
  moduleId: z.string().min(1),
  lessonId: z.string().min(1),
  answerIndex: z.number().int().min(0),
  correctIndex: z.number().int().min(0),
  totalQuizzes: z.number().int().min(1)
});

// Schema de validação para atualização de certificação
export const updateCertificationProgressSchema = z.object({
  userName: z.string().min(3).max(100).optional(),
  finalExamScore: z.number().min(0).max(100).optional(),
  completedAt: z.string().optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type LessonProgressInput = z.infer<typeof lessonProgressSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type UpdateCertificationProgressInput = z.infer<typeof updateCertificationProgressSchema>;
