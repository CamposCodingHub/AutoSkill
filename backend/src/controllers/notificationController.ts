import { Response } from 'express';
import { sendEmail, checkEmailConfig, sendWelcomeEmail, sendProgressEmail, sendAchievementEmail } from '../services/emailService';
import { AuthRequest } from '../middleware/auth';

export const sendNotificationEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { to, subject, body, variables } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, subject, body' });
    }

    const config = checkEmailConfig();
    if (!config.hasConfig) {
      return res.status(500).json({ 
        error: 'Configuração de SMTP não encontrada. Configure as variáveis de ambiente SMTP_USER e SMTP_PASS.' 
      });
    }

    const result = await sendEmail({ to, subject, body, variables });

    if (result.success) {
      res.json({ message: 'Email enviado com sucesso', messageId: result.messageId });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
};

// Enviar email de teste com template HTML profissional
export const sendTestEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { to, type, name, lesson, achievement } = req.body;

    if (!to || !type) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, type' });
    }

    const config = checkEmailConfig();
    if (!config.hasConfig) {
      return res.status(500).json({ 
        error: 'Configuração de SMTP não encontrada. Configure as variáveis de ambiente SMTP_USER e SMTP_PASS.' 
      });
    }

    let result;
    const userName = name || 'Usuário Teste';
    const lessonName = lesson || 'Aula Teste';
    const achievementName = achievement || 'Conquista Teste';

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(to, userName);
        break;
      case 'progress':
        result = await sendProgressEmail(to, userName, lessonName);
        break;
      case 'achievement':
        result = await sendAchievementEmail(to, userName, achievementName);
        break;
      default:
        return res.status(400).json({ error: 'Tipo de template inválido. Use: welcome, progress, ou achievement' });
    }

    if (result.success) {
      res.json({ message: 'Email de teste enviado com sucesso', messageId: result.messageId });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Erro ao enviar email de teste:', error);
    res.status(500).json({ error: 'Erro ao enviar email de teste' });
  }
};

export const checkEmailConfiguration = async (req: AuthRequest, res: Response) => {
  try {
    const config = checkEmailConfig();
    res.json(config);
  } catch (error) {
    console.error('Erro ao verificar configuração:', error);
    res.status(500).json({ error: 'Erro ao verificar configuração' });
  }
};
