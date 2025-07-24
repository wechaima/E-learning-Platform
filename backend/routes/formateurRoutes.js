import express from 'express';
import {
  listFormateurs,
  updateFormateur,
  deleteFormateur
} from '../controllers/formateurController.js';
import { authenticate, isAdminOrSuperAdmin} from '../midddleware/auth.js';
;


const router = express.Router();

// Middleware pour toutes les routes
router.use(authenticate, isAdminOrSuperAdmin);

// Routes CRUD pour formateurs
router.get('/', authenticate, isAdminOrSuperAdmin, listFormateurs);
router.put('/:id',authenticate, isAdminOrSuperAdmin, updateFormateur);
router.delete('/:id',authenticate, isAdminOrSuperAdmin, deleteFormateur);

export default router;