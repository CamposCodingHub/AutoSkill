import { Router } from 'express';
import { 
  createPortfolio, 
  getPortfolios, 
  getMyPortfolios, 
  updatePortfolio, 
  deletePortfolio, 
  likePortfolio 
} from '../controllers/portfolioController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rotas públicas
router.get('/', getPortfolios);
router.get('/:portfolioId/like', authMiddleware, likePortfolio);

// Rotas protegidas
router.post('/', authMiddleware, createPortfolio);
router.get('/my', authMiddleware, getMyPortfolios);
router.put('/:portfolioId', authMiddleware, updatePortfolio);
router.delete('/:portfolioId', authMiddleware, deletePortfolio);

export default router;
