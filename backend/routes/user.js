import express from 'express';
import { changePassword, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../midddleware/auth.js';


const router = express.Router();

// Mettre à jour le profil utilisateur
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;