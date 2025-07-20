import User from '../models/User.js';

// Récupère tous les visiteurs (étudiants)
export const getVisiteurs = async (req, res) => {
  try {
    // Trouve tous les utilisateurs avec rôle 'etudiant'
    const visiteurs = await User.find(
      { role: 'etudiant' },
      { 
        nom: 1, 
        prenom: 1, 
        email: 1,
        createdAt: 1,
        _id: 0 
      }
    ).sort({ createdAt: -1 }); // Tri par date de création décroissante

    res.status(200).json({
      success: true,
      count: visiteurs.length,
      data: visiteurs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des visiteurs',
      error: error.message
    });
  }
};