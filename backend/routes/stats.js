import express from 'express';
import { getDashboardStats, getEtudiantStats, getFormateurStats } from '../controllers/statsController.js';

import { isAdminOrSuperAdmin } from '../midddleware/auth.js';

const router = express.Router();

// Route pour obtenir toutes les statistiques
router.get('/dashboard-stats', getDashboardStats);
// routes/statsRoutes.js
router.get('/formateurs/:id/stats',  getFormateurStats);
router.get('/etudiants/:id/stats',   getEtudiantStats);
export default router;