import nodemailer from 'nodemailer';
import { getWelcomeEmailHTML, getProgressEmailHTML, getAchievementEmailHTML } from '../templates/emailTemplates';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
  variables?: Record<string, string>;
}

// Criar transporter do Nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Substituir variáveis no template
const replaceVariables = (template: string, variables: Record<string, string>) => {
  let result = template;
  Object.keys(variables).forEach(key => {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), variables[key]);
  });
  return result;
};

// Enviar email
export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = createTransporter();
    
    // Substituir variáveis no corpo do email
    const body = options.variables 
      ? replaceVariables(options.body, options.variables)
      : options.body;

    // HTML já vem pronto com variáveis substituídas
    const html = options.html;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"AutoSkill" <noreply@autoskill.com>',
      to: options.to,
      subject: options.subject,
      text: body,
      html: html || body.replace(/\n/g, '<br>'),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
};

// Enviar email de boas-vindas
export const sendWelcomeEmail = async (to: string, name: string) => {
  return sendEmail({
    to,
    subject: 'Bem-vindo ao AutoSkill! ⚡',
    body: `Olá ${name},\n\nBem-vindo ao AutoSkill! Estamos felizes em ter você conosco.\n\nComece sua jornada agora!`,
    html: getWelcomeEmailHTML(name),
    variables: { name },
  });
};

// Enviar email de progresso
export const sendProgressEmail = async (to: string, name: string, lesson: string) => {
  return sendEmail({
    to,
    subject: 'Você completou uma aula! 🎉',
    body: `Parabéns ${name}!\n\nVocê completou a aula "${lesson}". Continue assim!`,
    html: getProgressEmailHTML(name, lesson),
    variables: { name, lesson },
  });
};

// Enviar email de conquista
export const sendAchievementEmail = async (to: string, name: string, achievement: string) => {
  return sendEmail({
    to,
    subject: 'Nova conquista desbloqueada! 🏆',
    body: `Incrível ${name}!\n\nVocê desbloqueou a conquista "${achievement}"!`,
    html: getAchievementEmailHTML(name, achievement),
    variables: { name, achievement },
  });
};

// Verificar configuração de SMTP
export const checkEmailConfig = () => {
  return {
    hasConfig: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
  };
};
