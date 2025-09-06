import User from '../models/User.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import mongoose from 'mongoose';

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


export const getFormateurStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID formateur invalide'
      });
    }

    const formateur = await User.findById(id);
    if (!formateur || formateur.role !== 'formateur') {
      return res.status(404).json({ 
        success: false,
        message: 'Formateur non trouvé' 
      });
    }
    
    const courseCount = await Course.countDocuments({ createdBy: id });
    const courses = await Course.find({ createdBy: id }).select('followers');
    
    let followerCount = 0;
    courses.forEach(course => {
      followerCount += course.followers.length;
    });
    
    res.json({
      success: true,
      data: {
        ...formateur.toObject(),
        courseCount,
        followerCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: err.message
    });
  }
};

export const getEtudiantStats = async (req, res) => {
  try {
    const { id } = req.params;
    const etudiant = await User.findById(id).select('nom prenom email');
    if (!etudiant) {
      return res.status(404).json({ 
        success: false,
        message: 'Étudiant non trouvé' 
      });
    }
    // 1. Récupération des progressions avec les données nécessaires
    const progressList = await Progress.find({ userId: id })
      .populate({
        path: 'courseId',
        select: 'title'
      })
      .populate({
        path: 'chapterProgress.chapterId',
        select: 'title'
      });

    // 2. Calcul des statistiques globales
    const stats = {
      enrolledCoursesCount: progressList.length,
      completedCoursesCount: progressList.filter(p => p.completed || p.overallProgress >= 100).length,
      averageQuizScore: null,
      quizAttempts: 0
    };

    // 3. Calcul spécifique des quiz (comme dans getUserProgress)
    const allQuizScores = progressList
      .flatMap(p => p.chapterProgress
        .filter(cp => cp.quizCompleted)
        .map(cp => cp.quizScore)
      )
      .filter(score => typeof score === 'number');

    if (allQuizScores.length > 0) {
      stats.averageQuizScore = Math.round(
        allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length
      );
      stats.quizAttempts = allQuizScores.length;
    }

    // 4. Formatage de la réponse
    res.json({
      success: true,
      data: {   nom: etudiant.nom,
        prenom: etudiant.prenom,
        email: etudiant.email,
        ...stats,
        courses: progressList.map(p => ({
          
          courseId: p.courseId?._id,
          title: p.courseId?.title,
          progress: p.overallProgress,
          completed: p.completed || p.overallProgress >= 100
        }))
      }
    });

  } catch (err) {
    console.error('Erreur dans getEtudiantStats:', {
      error: err.message,
      userId: req.params.id
    });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};