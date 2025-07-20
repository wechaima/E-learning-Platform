import express from 'express'; 
import { getVisiteurs } from '../controllers/visiteurController.js';
import { authenticate, isAdmin } from '../midddleware/auth.js';

const router = express.Router();

// Route protégée : GET /api/visiteurs
router.get('/visiteurs', authenticate, isAdmin, getVisiteurs);

export default router;