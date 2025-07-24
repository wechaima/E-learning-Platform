import { Router } from 'express';
import { 
  register, 
  createFormateur, 
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  
 
} from '../controllers/authController.js';
import {   authenticate,  isAdminOrSuperAdmin } from '../midddleware/auth.js';





const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Admin-only routes
router.post('/formateurs', authenticate, isAdminOrSuperAdmin, createFormateur);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
export default router;