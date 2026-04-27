import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword, getPublicProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { loginRateLimiter, registerRateLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/register', registerRateLimiter, register);
router.post('/login', loginRateLimiter, login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.get('/profile/:userId', getPublicProfile);

// Endpoint reset-admin removido por motivo de segurança
// Use o script de seed ou diretamente no banco para resetar admin

export default router;
