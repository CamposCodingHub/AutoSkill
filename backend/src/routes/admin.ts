import { Router } from 'express';
import { getAllUsers, deleteUser, updateUserRole, updateUser } from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas de admin requerem autenticação E permissão de admin
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/users/:userId', authMiddleware, adminMiddleware, deleteUser);
router.put('/users/:userId/role', authMiddleware, adminMiddleware, updateUserRole);
router.put('/users/:userId', authMiddleware, adminMiddleware, updateUser);

export default router;
