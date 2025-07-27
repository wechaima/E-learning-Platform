import Progress from '../models/Progress.js';
import Course from '../models/Course.js';

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
    const userId = req.user._id;
    
    // 1. Récupérer tous les cours suivis par l'utilisateur avec les détails nécessaires
    const courses = await Course.find({ followers: userId })
      .select('_id title imageUrl')
      .populate({
        path: 'chapters',
        select: '_id title sections',
        populate: {
          path: 'quiz',
          select: '_id'
        }
      });

    // 2. Récupérer toutes les progressions avec les détails nécessaires
    const progressList = await Progress.find({ userId })
      .populate({
        path: 'courseId',
        select: 'title'
      });

    // 3. Calculer les statistiques globales
    let totalCourses = courses.length;
    let completedCourses = 0;
    let averageScore = 0;
    let totalQuizzesTaken = 0;

    // 4. Combiner les données
    const progressData = courses.map(course => {
      const progress = progressList.find(p => 
        p.courseId && p.courseId._id.toString() === course._id.toString()
      );
      
      // Calculer le nombre total de sections dans le cours
      const totalSections = course.chapters.reduce((acc, chapter) => 
        acc + (chapter.sections?.length || 0), 0);

      // Calculer les sections complétées
      let completedSections = 0;
      const chapterProgress = course.chapters.map(chapter => {
        const chapProgress = progress?.chapterProgress?.find(cp => 
          cp.chapterId.toString() === chapter._id.toString()
        );
        
        completedSections += chapProgress?.completedSections?.length || 0;

        return {
          chapterId: chapter._id,
          chapterTitle: chapter.title,
          quizScore: chapProgress?.quizScore || null,
          quizCompleted: chapProgress?.quizCompleted || false,
          completedSections: chapProgress?.completedSections?.length || 0,
          totalSections: chapter.sections?.length || 0
        };
      });

      // Calculer la progression globale
      const overallProgress = totalSections > 0 
        ? Math.round((completedSections / totalSections) * 100)
        : 0;

      // Calculer le score moyen des quiz
      const quizScores = chapterProgress
        .filter(ch => ch.quizCompleted)
        .map(ch => ch.quizScore);
      
      const averageQuizScore = quizScores.length > 0
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : null;

      // Mettre à jour les statistiques globales
      if (overallProgress >= 100) completedCourses++;
      if (averageQuizScore !== null) {
        averageScore += averageQuizScore;
        totalQuizzesTaken++;
      }

      return {
        courseId: course._id,
        courseTitle: course.title,
        courseImage: course.imageUrl,
        overallProgress,
        averageQuizScore,
        chapterProgress,
        totalSections,
        completedSections
      };
    });

    // Calculer la moyenne globale des quiz
    averageScore = totalQuizzesTaken > 0 
      ? Math.round(averageScore / totalQuizzesTaken)
      : null;

    res.json({ 
      success: true, 
      data: {
        courses: progressData.filter(course => 
          course.overallProgress > 0 || 
          course.chapterProgress.some(ch => ch.quizCompleted || ch.completedSections > 0)
        ),
        stats: {
          totalCourses,
          completedCourses,
          averageScore,
          completionPercentage: totalCourses > 0 
            ? Math.round((completedCourses / totalCourses) * 100)
            : 0
        }
      }
    });
  } catch (err) {
    console.error('Error in getUserProgress:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};