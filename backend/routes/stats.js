import express from 'express';
import { getDashboardStats } from '../controllers/statsController.js';

const router = express.Router();

// Route pour obtenir toutes les statistiques
router.get('/dashboard-stats', getDashboardStats);

export default router;