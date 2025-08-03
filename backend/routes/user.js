import express from 'express';
import { updateProfile } from '../controllers/userController.js';
import { authenticate, isEtudiant } from '../midddleware/auth.js';


const router = express.Router();

// Mettre à jour le profil utilisateur
router.put('/profile', authenticate, updateProfile);

export default router;