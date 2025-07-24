import { Router } from 'express';
const router = Router();



import { authenticate, isAdmin, isAdminOrSuperAdmin} from '../midddleware/auth.js';
import { createAdmin, deleteAdmin, getAllAdmins, updateAdmin } from '../controllers/adminController.js';



// Lister tous les utilisateurs
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes protégées pour les admins
// Route pour créer un admin
router.post('/admins', authenticate, isAdminOrSuperAdmin, createAdmin );
router.get('/admins', authenticate, isAdminOrSuperAdmin, getAllAdmins);
router.put('/admins/:id', authenticate, isAdminOrSuperAdmin, updateAdmin);
router.delete('/admins/:id', authenticate, isAdminOrSuperAdmin, deleteAdmin);

export default router;