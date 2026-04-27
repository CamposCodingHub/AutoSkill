import { Router } from 'express';
import { createAuditLog, getAuditLogs, getAuditLogById } from '../controllers/auditController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação e permissão de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Criar log de auditoria
router.post('/', createAuditLog);

// Listar logs de auditoria
router.get('/', getAuditLogs);

// Buscar log por ID
router.get('/:id', getAuditLogById);

export default router;
