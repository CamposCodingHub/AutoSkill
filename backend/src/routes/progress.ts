import { Router } from 'express';
import { getProgress, updateLessonProgress, saveQuizAnswer, getLeaderboard } from '../controllers/progressController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getProgress);
router.put('/lessons/:moduleId/:lessonId', authMiddleware, updateLessonProgress);
router.post('/quiz', authMiddleware, saveQuizAnswer);
router.get('/leaderboard', authMiddleware, getLeaderboard);

export default router;
