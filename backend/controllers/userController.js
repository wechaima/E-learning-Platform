import User from '../models/User.js';
import bcrypt from 'bcryptjs';
export const updateProfile = async (req, res) => {
  try {
    const { nom, prenom, email } = req.body;
    
    // Vérification des données requises
    if (!nom || !prenom || !email) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires'
      });
    }

    // Mise à jour garantie puisque req.user existe grâce au middleware
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { nom, prenom, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      // Normalement impossible grâce au middleware
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé après vérification'
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour',
      data: user
    });

  } catch (error) {
    console.error('Erreur updateProfile:', error);
    
    // Gestion spécifique des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(val => val.message)[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
// Dans votre contrôleur utilisateur

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation basique
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Les champs sont requis' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Ancien mot de passe incorrect' 
      });
    }

    // Valider le nouveau mot de passe
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: '8 caractères minimum requis' 
      });
    }

    if (!/[A-Z]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({ 
        success: false,
        message: 'Majuscule et caractère spécial requis' 
      });
    }

    // Hacher et sauvegarder
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      success: true,
      message: 'Mot de passe mis à jour' 
    });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur' 
    });
  }
};