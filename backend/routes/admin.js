import { Router } from 'express';
const router = Router();
import { find } from '../models/User';
import { isAdmin } from '../middleware/auth';

// Lister tous les utilisateurs
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;