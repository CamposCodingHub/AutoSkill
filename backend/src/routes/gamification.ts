import { Router } from 'express';
import { getGamificationProfile, updateGamificationProfile } from '../controllers/gamificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/profile', authMiddleware, getGamificationProfile);
router.put('/profile', authMiddleware, updateGamificationProfile);

export default router;
