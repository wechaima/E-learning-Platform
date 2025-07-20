import { Router } from 'express';
import { 
  register, 
  createFormateur, 
  login 
} from '../controllers/authController.js';
import { auth } from '../midddleware/auth.js';


const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Admin-only routes
router.post('/formateurs', auth('admin'), createFormateur);

export default router;