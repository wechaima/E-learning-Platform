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
  changePassword,
  
 
} from '../controllers/authController.js';
import {     authenticate, isAdminOrSuperAdmin } from '../midddleware/auth.js';





const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
changePassword
// Admin-only routes
router.post('/formateurs', authenticate, isAdminOrSuperAdmin, createFormateur);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
export default router;