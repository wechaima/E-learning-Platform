import express from 'express'; 
import { getEtudiants, } from '../controllers/etudiantController.js';
import { authenticate, isAdminOrSuperAdmin } from '../midddleware/auth.js';

const router = express.Router();

// Route protégée : GET /api/Etudiants
router.get('/Etudiants', authenticate, isAdminOrSuperAdmin, getEtudiants);

export default router;