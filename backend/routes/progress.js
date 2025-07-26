import express from 'express';
import { 
  getProgress, 

  
} from '../controllers/progressController.js';
import { authenticate } from '../midddleware/auth.js';
import { updateProgress } from '../controllers/courseController.js';


const router = express.Router();

// Obtenir la progression
router.get('/:courseId', authenticate, getProgress);



// Mettre à jour la progression
router.post('/:courseId/update', authenticate, updateProgress);

export default router;