import { Router } from 'express';
import { 
  createMentorshipRequest, 
  getMentorshipRequests, 
  getMyMentorships, 
  acceptMentorship, 
  rejectMentorship, 
  completeMentorship,
  getAvailableMentors
} from '../controllers/mentorshipController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rotas protegidas
router.post('/', authMiddleware, createMentorshipRequest);
router.get('/requests', authMiddleware, getMentorshipRequests);
router.get('/my', authMiddleware, getMyMentorships);
router.get('/mentors', getAvailableMentors);
router.put('/:mentorshipId/accept', authMiddleware, acceptMentorship);
router.put('/:mentorshipId/reject', authMiddleware, rejectMentorship);
router.put('/:mentorshipId/complete', authMiddleware, completeMentorship);

export default router;
