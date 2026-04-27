import { Router } from 'express';
import { sendNotificationEmail, sendTestEmail, checkEmailConfiguration } from '../controllers/notificationController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação e permissão de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Enviar email de notificação
router.post('/send', sendNotificationEmail);

// Enviar email de teste com template HTML profissional
router.post('/test', sendTestEmail);

// Verificar configuração de email
router.get('/config', checkEmailConfiguration);

export default router;
