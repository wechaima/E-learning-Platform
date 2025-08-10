import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId
    });

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    res.json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};



export const getUserProgress = async (req, res) => {
  try {
    // 1. Vérification et conversion de l'ID utilisateur
    if (!req.user?.id) {
      return res.status(400).json({ success: false, message: "ID utilisateur manquant" });
    }

    let userId;
    try {
      userId = new ObjectId(req.user.id); // Conversion explicite
    } catch (err) {
      return res.status(400).json({ success: false, message: "Format d'ID utilisateur invalide" });
    }

    // 2. Récupération des données AVEC logging critique
    const progressList = await Progress.find({ userId })
      .populate({
        path: 'courseId',
        select: 'title imageUrl',
      });

    console.log("Debug - Données trouvées:", {
      userIdRecherché: userId,
      progressTrouvées: progressList.map(p => ({
        courseId: p.courseId?.id,
        overallProgress: p.overallProgress,
        chapters: p.chapterProgress.length
      }))
    });

    // 3. Gestion du cas "aucune progression"
    if (progressList.length === 0) {
      return res.json({ 
        success: true,
        data: { courses: [], stats: { } }
      });
    }

    // 4. Calcul des statistiques (adapté à votre structure de données)
    const stats = {
      totalCourses: progressList.length,
      completedCourses: progressList.filter(p => p.overallProgress >= 100).length,
      averageScore: null,
      completionPercentage: 0
    };

    // 5. Calcul du score moyen des quiz
    const allQuizScores = progressList
      .flatMap(p => p.chapterProgress
        .filter(cp => cp.quizCompleted)
        .map(cp => cp.quizScore)
      )
      .filter(score => score !== null);

    if (allQuizScores.length > 0) {
      stats.averageScore = Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length);
    }

    // 6. Formatage de la réponse
    const courses = progressList.map(progress => ({
      courseId: progress.courseId?.id || null,
      courseTitle: progress.courseId?.title || "Cours inconnu",
      courseImage: progress.courseId?.imageUrl || null,
      overallProgress: progress.overallProgress || 0,
      chapterProgress: progress.chapterProgress.map(cp => ({
        chapterId: cp.chapterId,
        quizScore: cp.quizScore,
        quizCompleted: cp.quizCompleted,
        completedSections: cp.completedSections?.length || 0,
      })),
    }));

    res.json({ success: true, data: { courses, stats } });

  } catch (err) {
    console.error("Erreur complète:", {
      message: err.message,
      stack: err.stack,
      userIdAttempted: req.user?.id
    });
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
