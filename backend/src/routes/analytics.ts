import { Router } from 'express';
import { getAdvancedAnalytics, getUserAnalytics } from '../controllers/analyticsController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação e permissão de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Analytics avançado de todos os usuários
router.get('/', getAdvancedAnalytics);

// Analytics de um usuário específico
router.get('/user/:userId', getUserAnalytics);

export default router;
