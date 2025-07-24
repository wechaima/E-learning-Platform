import Course from '../models/Course.js';
import Section from '../models/Section.js';
import Quiz from '../models/Quiz.js';

import Progress from '../models/Progress.js';
import Question from '../models/Question.js';

// Créer un nouveau cours avec sections et quiz
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, imageUrl, sections, quiz } = req.body;
    
    // Validation des données requises
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Titre, description et catégorie sont obligatoires'
      });
    }

    // Création du cours de base
    const newCourse = new Course({
      title,
      description,
      imageUrl: imageUrl || 'default-course.jpg',
      category,
      createdBy: req.user.id
    });

    // Sauvegarde initiale du cours
    const savedCourse = await newCourse.save();

    // Création des sections si fournies
    if (sections && sections.length > 0) {
      const createdSections = await Section.insertMany(
        sections.map(section => ({
          ...section,
          courseId: savedCourse._id
        }))
      );
      savedCourse.sections = createdSections.map(s => s._id);
    }

    // Création du quiz si fourni
    if (quiz && quiz.questions) {
      const newQuiz = new Quiz({
        courseId: savedCourse._id
      });
      const savedQuiz = await newQuiz.save();

      // Création des questions
      const createdQuestions = await Question.insertMany(
        quiz.questions.map(question => ({
          ...question,
          quizId: savedQuiz._id
        }))
      );
      
      savedQuiz.questions = createdQuestions.map(q => q._id);
      await savedQuiz.save();
      savedCourse.quiz = savedQuiz._id;
    }

    // Sauvegarde finale du cours avec les références
    const finalCourse = await savedCourse.save();
    
    // Récupération complète avec les populate
    const populatedCourse = await Course.findById(finalCourse._id)
      .populate({
        path: 'createdBy',
        select: 'nom prenom email'
      })
      .populate({
        path: 'sections',
        select: 'title description videoUrl'
      })
      .populate({
        path: 'quiz',
        populate: {
          path: 'questions',
          select: 'text options'
        }
      });

    res.status(201).json({
      success: true,
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du cours',
      error: error.message
    });
  }
};

// Récupérer tous les cours (version légère)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('createdBy', 'nom prenom email')
      .select('-sections -quiz'); // Exclut les données lourdes

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours',
      error: error.message
    });
  }
};

// Récupérer un cours spécifique avec tous les détails
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching course with ID:', id);

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide'
      });
    }

    const course = await Course.findById(id)
      .populate({ path: 'createdBy', select: 'nom prenom email' })
      .populate({ path: 'sections', select: 'title description videoUrl' })
      .populate({ path: 'quiz', populate: { path: 'questions', select: 'text options' } });

    console.log('Course found:', course);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Ajout de la progression si utilisateur connecté
    if (req.user) {
      console.log('User:', req.user.id);
      const progress = await Progress.findOne({ userId: req.user.id, courseId: course._id });
      if (progress) {
        course._doc.progress = progress.progress || 0;
        course._doc.completed = progress.completed || false;
        course._doc.score = progress.score || 0;
      }
    } else {
      console.log('No user authenticated');
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Server error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
// Modifier un cours existant
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, imageUrl, sections, quiz } = req.body;

    // Vérifier que le cours existe
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Vérifier que l'utilisateur est bien le créateur du cours
    if (existingCourse.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Seul le formateur créateur peut modifier ce cours'
      });
    }

    // Mise à jour des champs de base
    if (title) existingCourse.title = title;
    if (description) existingCourse.description = description;
    if (category) existingCourse.category = category;
    if (imageUrl) existingCourse.imageUrl = imageUrl;

    // Mise à jour des sections si fournies
    if (sections && Array.isArray(sections)) {
      // Supprimer les anciennes sections
      await Section.deleteMany({ courseId: existingCourse._id });

      // Créer les nouvelles sections
      const createdSections = await Section.insertMany(
        sections.map(section => ({
          ...section,
          courseId: existingCourse._id
        }))
      );
      existingCourse.sections = createdSections.map(s => s._id);
    }

    // Mise à jour du quiz si fourni
    if (quiz && quiz.questions) {
      // Supprimer l'ancien quiz et ses questions
      const oldQuiz = await Quiz.findById(existingCourse.quiz);
      if (oldQuiz) {
        await Question.deleteMany({ quizId: oldQuiz._id });
        await Quiz.findByIdAndDelete(oldQuiz._id);
      }

      // Créer le nouveau quiz
      const newQuiz = new Quiz({
        courseId: existingCourse._id
      });
      const savedQuiz = await newQuiz.save();

      // Créer les nouvelles questions
      const createdQuestions = await Question.insertMany(
        quiz.questions.map(question => ({
          ...question,
          quizId: savedQuiz._id
        }))
      );
      
      savedQuiz.questions = createdQuestions.map(q => q._id);
      await savedQuiz.save();
      existingCourse.quiz = savedQuiz._id;
    }

    // Sauvegarder les modifications
    const updatedCourse = await existingCourse.save();

    // Récupérer le cours complet avec les populate
    const populatedCourse = await Course.findById(updatedCourse._id)
      .populate({
        path: 'createdBy',
        select: 'nom prenom email'
      })
      .populate({
        path: 'sections',
        select: 'title description videoUrl'
      })
      .populate({
        path: 'quiz',
        populate: {
          path: 'questions',
          select: 'text options'
        }
      });

    res.status(200).json({
      success: true,
      message: 'Cours mis à jour avec succès',
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du cours',
      error: error.message
    });
  }
};
// Supprimer un cours
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le cours existe
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Vérifier que l'utilisateur est bien le créateur du cours
    if (course.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Seul le formateur créateur peut supprimer ce cours'
      });
    }

    // Supprimer les sections associées
    await Section.deleteMany({ courseId: course._id });

    // Supprimer le quiz et ses questions associées
    if (course.quiz) {
      await Question.deleteMany({ quizId: course.quiz });
      await Quiz.findByIdAndDelete(course.quiz);
    }

    // Supprimer les progressions associées
    await Progress.deleteMany({ courseId: course._id });

    // Finalement supprimer le cours
    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Cours supprimé avec succès',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du cours',
      error: error.message
    });
  }
};