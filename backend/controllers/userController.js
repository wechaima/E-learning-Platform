import User from '../models/User.js';

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