import User from '../models/User.js';
import Course from '../models/Course.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Compter les étudiants
    const etudiantsCount = await User.countDocuments({ role: 'etudiant' });
    
    // Compter les formateurs
    const formateursCount = await User.countDocuments({ role: 'formateur' });
    
    // Compter les admins
    const adminsCount = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
    
    // Compter les cours
    const coursCount = await Course.countDocuments();
    
    // Compter les abonnements (total des followers sur tous les cours)
    const abonnementsResult = await Course.aggregate([
      {
        $project: {
          followersCount: { $size: "$followers" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$followersCount" }
        }
      }
    ]);
    
    const abonnementsCount = abonnementsResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        etudiants: etudiantsCount,
        formateurs: formateursCount,
        admins: adminsCount,
        cours: coursCount,
        abonnements: abonnementsCount
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};