import { Router } from 'express';
import {
  createCertification,
  getCertifications,
  getUserCertificationProgress,
  checkEligibility,
  issueCertificate,
  getAllCertifications,
  updateCertification,
  deleteCertification,
  issueCertificateManually,
  updateCertificationProgress,
  deleteCertificationProgress
} from '../controllers/certificationController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

// Rotas públicas (usuários autenticados)
router.get('/', authMiddleware, getCertifications);
router.get('/progress', authMiddleware, getUserCertificationProgress);
router.get('/:certificationId/eligibility', authMiddleware, checkEligibility);
router.post('/:certificationId/issue', authMiddleware, issueCertificate);

// Rotas de admin
router.get('/admin/all', authMiddleware, adminMiddleware, getAllCertifications);
router.post('/', authMiddleware, adminMiddleware, createCertification);
router.put('/:certificationId', authMiddleware, adminMiddleware, updateCertification);
router.delete('/:certificationId', authMiddleware, adminMiddleware, deleteCertification);
router.post('/admin/issue-manual', authMiddleware, adminMiddleware, issueCertificateManually);
router.put('/progress/:id', authMiddleware, adminMiddleware, updateCertificationProgress);
router.delete('/progress/:id', authMiddleware, adminMiddleware, deleteCertificationProgress);

export default router;
