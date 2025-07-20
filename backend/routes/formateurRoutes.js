import express from 'express';
import {
  listFormateurs,
  updateFormateur,
  deleteFormateur
} from '../controllers/formateurController.js';
import { authenticate, isAdmin } from '../midddleware/auth.js';


const router = express.Router();

// Middleware pour toutes les routes
router.use(authenticate, isAdmin);

// Routes CRUD pour formateurs
router.get('/',isAdmin, listFormateurs);
router.put('/:id',isAdmin, updateFormateur);
router.delete('/:id',isAdmin, deleteFormateur);

export default router;