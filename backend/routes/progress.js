import express from 'express';
import { 
  getProgress,
  getUserProgress
} from '../controllers/progressController.js';
import { authenticate, isEtudiant } from '../midddleware/auth.js';

const router = express.Router();

// Route pour la progression d'un cours spécifique
router.get('/:courseId', authenticate, getProgress);

// Route pour toutes les progressions de l'utilisateur
router.get('/', authenticate, isEtudiant, getUserProgress);

export default router;