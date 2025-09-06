import express from 'express';
import { changePassword, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../midddleware/auth.js';

import User from '../models/User.js';


const router = express.Router();

// Mettre à jour le profil utilisateur
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
// routes/userRoutes.js



// Nouvelle route pour trouver un user par email
router.get('/by-email/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Erreur recherche par email:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});


export default router;