import Course from '../models/Course.js';
import Chapter from '../models/Chapter.js';
import Section from '../models/Section.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Progress from '../models/Progress.js';
import mongoose from 'mongoose';  
// Créer un nouveau cours avec chapitres
export const createCourse = async (req, res) => {
  try {
    const { title, description, imageUrl, category, chapters } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le titre, la description et la catégorie sont obligatoires' 
      });
    }

    // 1. Création du cours
    const newCourse = new Course({
      title,
      description,
      imageUrl: imageUrl || 'default-course.jpg',
      category,
      createdBy: userId
    });
    await newCourse.save();

    // 2. Traitement des chapitres
    if (chapters && chapters.length > 0) {
      for (const chapterData of chapters) {
        // 2.1 Création du chapitre
        const newChapter = new Chapter({
          title: chapterData.title,
          courseId: newCourse._id,
          order: chapterData.order || 0
        });
        await newChapter.save();

        // 2.2 Traitement des sections
        if (chapterData.sections && chapterData.sections.length > 0) {
          const sections = await Section.insertMany(
            chapterData.sections.map(section => ({
              title: section.title,
              content: section.content,
              videoUrl: section.videoUrl,
              order: section.order,
              chapterId: newChapter._id
            }))
          );
          newChapter.sections = sections.map(s => s._id);
          await newChapter.save();
        }

        // 2.3 Traitement du quiz (si existant)
        if (chapterData.quiz && chapterData.quiz.questions) {
          // Création du quiz
          const newQuiz = new Quiz({
            passingScore: chapterData.quiz.passingScore || 70,
            chapterId: newChapter._id
          });
          await newQuiz.save();

          // Création des questions
          const questions = await Question.insertMany(
            chapterData.quiz.questions.map(question => ({
              text: question.text,
              options: question.options.map((opt, index) => ({
                text: opt,
                isCorrect: index === question.correctOption
              })),
              explanation: question.explanation,
              quizId: newQuiz._id
            }))
          );

          // Mise à jour du quiz avec les questions
          newQuiz.questions = questions.map(q => q._id);
          await newQuiz.save();

          // Lier le quiz au chapitre
          newChapter.quiz = newQuiz._id;
          await newChapter.save();
        }

        // Ajouter le chapitre au cours
        newCourse.chapters.push(newChapter._id);
      }
    }

    // Sauvegarde finale du cours
    await newCourse.save();

    // Récupération complète avec les relations
    const fullCourse = await Course.findById(newCourse._id)
      .populate({
        path: 'chapters',
        populate: [
          { path: 'sections' },
          { 
            path: 'quiz',
            populate: {
              path: 'questions'
            }
          }
        ]
      })
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: fullCourse
    });

  } catch (error) {
    console.error('Erreur création cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du cours',
      error: error.message
    });
  }
};

// controllers/courseController.js
// controllers/courseController.js
export const getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'prenom nom')
      .populate({
        path: 'chapters',
        populate: {
          path: 'sections',
          options: { sort: { order: 1 } } // Tri par ordre si nécessaire
        },
        options: { sort: { order: 1 } }
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    res.json({
      success: true,
      data: course
    });

  } catch (err) {
    console.error('Error in getCourseDetails:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
export const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapterId, sectionIndex } = req.body;

    let progress = await Progress.findOneAndUpdate(
      { userId: req.user.id, courseId },
      {
        $set: {
          [`chapterProgress.$[elem].completedSections.${sectionIndex}`]: true,
          updatedAt: new Date()
        }
      },
      {
        new: true,
        arrayFilters: [{ "elem.chapterId": chapterId }],
        upsert: true
      }
    );

    // Calculer la progression globale
    const course = await Course.findById(courseId).populate('chapters');
    const totalSections = course.chapters.reduce((sum, chap) => sum + chap.sections.length, 0);
    const completedSections = progress.chapterProgress.reduce(
      (sum, chap) => sum + (chap.completedSections?.length || 0), 0
    );
    
    progress.overallProgress = Math.round((completedSections / totalSections) * 100);
    await progress.save();

    res.json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fonction helper pour créer un quiz
const createQuiz = async (quizData, chapterId) => {
  const { questions, passingScore } = quizData;
  
  const newQuiz = new Quiz({
    chapterId,
    passingScore: passingScore || 70
  });

  // Ajout des questions
  if (questions && questions.length > 0) {
    for (const questionData of questions) {
      const question = new Question({
        quizId: newQuiz._id,
        text: questionData.text,
        options: questionData.options
      });
      await question.save();
      newQuiz.questions.push(question._id);
    }
  }

  await newQuiz.save();
  return newQuiz;
};

// Suivre un cours
export const followCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Vérifier si le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cours non trouvé' 
      });
    }

    // Vérifier si l'utilisateur suit déjà le cours
    if (course.followers.includes(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vous suivez déjà ce cours' 
      });
    }

    // Ajouter l'utilisateur aux followers
    course.followers.push(userId);
    course.followerCount += 1;
    await course.save();

    // Créer une progression pour l'utilisateur
    const progress = new Progress({
      userId,
      courseId,
      chapterProgress: course.chapters.map(chapterId => ({
        chapterId,
        completed: false,
        quizScore: 0
      }))
    });
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Vous suivez maintenant ce cours',
      data: {
        courseId,
        followerCount: course.followerCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la tentative de suivi du cours',
      error: error.message
    });
  }
};

// Récupérer les cours suivis par un utilisateur
export const getFollowedCourses = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }

    // Trouver tous les cours où l'utilisateur est dans les followers
    const courses = await Course.find({ followers: userId })
      .populate({
        path: 'createdBy',
        select: 'nom prenom'
      })
      .select('-chapters -followers');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours suivis',
      error: error.message
    });
  }
};
// Récupérer un cours avec progression
export const getCourseWithProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await Course.findById(courseId)
      .populate({
        path: 'chapters',
        populate: [
          { path: 'sections' },
          { path: 'quiz', populate: 'questions' }
        ]
      })
      .populate('createdBy', 'name email');

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cours non trouvé' 
      });
    }

    const progress = await Progress.findOne({ 
      userId, 
      courseId 
    });

    const response = {
      ...course.toObject(),
      progress: progress || null
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du cours',
      error: error.message
    });
  }
};
// Récupérer tous les cours (version simplifiée)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({
        path: 'createdBy',
        select: 'nom prenom email'
      })
      .populate({
        path: 'chapters',
        select: 'title order',
        populate: {
          path: 'sections',
          select: 'title order'
        }
      });

    res.status(200).json({
      success: true,
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

// Mettre à jour un cours
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, category, chapters } = req.body;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cours invalide'
      });
    }

    // Trouver le cours existant
    let course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Vérifier les permissions
    if (course.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Action non autorisée'
      });
    }

    // Mettre à jour les champs de base
    course.title = title || course.title;
    course.description = description || course.description;
    course.imageUrl = imageUrl || course.imageUrl;
    course.category = category || course.category;

    // Gestion des chapitres
    if (chapters && Array.isArray(chapters)) {
      const newChapterIds = [];

      for (const chapterData of chapters) {
        let chapter;

        // Si le chapitre a un _id, on le met à jour
        if (chapterData._id && mongoose.Types.ObjectId.isValid(chapterData._id)) {
          chapter = await Chapter.findById(chapterData._id);
          if (chapter) {
            chapter.title = chapterData.title || chapter.title;
            chapter.order = chapterData.order || chapter.order;
            await chapter.save();
          }
        }

        // Sinon, on crée un nouveau chapitre
        if (!chapter) {
          chapter = new Chapter({
            title: chapterData.title,
            courseId: id,
            order: chapterData.order || chapters.length
          });
          await chapter.save();
        }

        // Gestion des sections
        if (chapterData.sections && Array.isArray(chapterData.sections)) {
          // Supprimer les anciennes sections
          await Section.deleteMany({ chapterId: chapter._id });

          const sections = await Section.insertMany(
            chapterData.sections.map((section, index) => ({
              title: section.title,
              content: section.content,
              videoUrl: section.videoUrl,
              order: section.order || index + 1,
              chapterId: chapter._id
            }))
          );
          chapter.sections = sections.map(s => s._id);
          await chapter.save();
        }

        // Gestion du quiz
        if (chapterData.quiz && chapterData.quiz.questions) {
          // Supprimer l'ancien quiz
          await Quiz.deleteMany({ chapterId: chapter._id });
          await Question.deleteMany({ quizId: { $in: await Quiz.find({ chapterId: chapter._id }).select('_id') } });

          const quiz = new Quiz({
            passingScore: chapterData.quiz.passingScore || 70,
            chapterId: chapter._id
          });
          const savedQuiz = await quiz.save();

          const questions = await Question.insertMany(
            chapterData.quiz.questions.map(question => ({
              text: question.text,
              options: question.options,
              explanation: question.explanation,
              quizId: savedQuiz._id
            }))
          );

          savedQuiz.questions = questions.map(q => q._id);
          await savedQuiz.save();

          chapter.quiz = savedQuiz._id;
          await chapter.save();
        }

        newChapterIds.push(chapter._id);
      }

      // Supprimer les chapitres qui ne sont plus dans la liste
      await Chapter.deleteMany({ courseId: id, _id: { $nin: newChapterIds } });
      course.chapters = newChapterIds;
    }

    // Sauvegarder les modifications
    await course.save();

    // Peupler les relations pour la réponse
    const populatedCourse = await Course.findById(course._id)
      .populate({
        path: 'chapters',
        populate: [
          { path: 'sections', options: { sort: { order: 1 } } },
          { path: 'quiz', populate: { path: 'questions' } }
        ],
        options: { sort: { order: 1 } }
      })
      .populate('createdBy', 'prenom nom');

    return res.status(200).json({
      success: true,
      message: 'Cours mis à jour avec succès',
      data: populatedCourse
    });

  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du cours',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Supprimer un cours
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cours invalide'
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Vérifier les permissions
    if (course.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé - Action interdite'
      });
    }

    // Récupérer tous les chapitres du cours
    const chapters = await Chapter.find({ courseId: id });
    const chapterIds = chapters.map(chapter => chapter._id);

    // Récupérer tous les quiz des chapitres
    const quizzes = await Quiz.find({ chapterId: { $in: chapterIds } });
    const quizIds = quizzes.map(quiz => quiz._id);

    // Récupérer toutes les sections des chapitres
    const sections = await Section.find({ chapterId: { $in: chapterIds } });
    const sectionIds = sections.map(section => section._id);

    // Suppression en cascade avec transactions pour plus de sécurité
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Supprimer toutes les questions des quiz
      await Question.deleteMany({ quizId: { $in: quizIds } }).session(session);

      // 2. Supprimer tous les quiz
      await Quiz.deleteMany({ _id: { $in: quizIds } }).session(session);

      // 3. Supprimer toutes les sections
      await Section.deleteMany({ _id: { $in: sectionIds } }).session(session);

      // 4. Supprimer tous les chapitres
      await Chapter.deleteMany({ _id: { $in: chapterIds } }).session(session);

      // 5. Supprimer toutes les progressions
      await Progress.deleteMany({ courseId: id }).session(session);

      // 6. Finalement supprimer le cours
      await Course.deleteOne({ _id: id }).session(session);

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Cours et tous ses éléments associés supprimés avec succès',
        data: { id }
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du cours',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Create a new chapter
export const createChapter = async (req, res) => {
  try {
    const { id } = req.params; // courseId
    const { title, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cours invalide',
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé',
      });
    }

    if (course.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé - Vous n\'êtes pas le créateur de ce cours',
      });
    }

    const newChapter = new Chapter({
      title,
      courseId: id,
      order: order || (course.chapters.length + 1),
    });

    await newChapter.save();
    course.chapters.push(newChapter._id);
    await course.save();

    const updatedCourse = await Course.findById(id)
      .populate({
        path: 'chapters',
        populate: [
          { path: 'sections' },
          { path: 'quiz', populate: 'questions' },
        ],
      });

    res.status(201).json({
      success: true,
      data: newChapter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du chapitre',
      error: error.message,
    });
  }
};

// Update a chapter
export const updateChapter = async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const { title, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé',
      });
    }

    if (course.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé - Vous n\'êtes pas le créateur de ce cours',
      });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapitre non trouvé',
      });
    }

    if (title) chapter.title = title;
    if (order) chapter.order = order;

    await chapter.save();

    res.status(200).json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du chapitre',
      error: error.message,
    });
  }
};

// Delete a chapter
export const deleteChapter = async (req, res) => {
  try {
    const { id, chapterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé',
      });
    }

    if (course.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé - Vous n\'êtes pas le créateur de ce cours',
      });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapitre non trouvé',
      });
    }

    await Promise.all([
      Section.deleteMany({ chapterId }),
      Quiz.deleteMany({ chapterId }),
      Question.deleteMany({ quizId: { $in: (await Quiz.find({ chapterId })).map(q => q._id) } }),
      Chapter.deleteOne({ _id: chapterId }),
    ]);

    course.chapters = course.chapters.filter((ch) => ch.toString() !== chapterId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Chapitre supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du chapitre',
      error: error.message,
    });
  }
};
// Create a new section
export const createSection = async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const { title, content, videoUrl, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé',
      });
    }

    if (course.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé - Vous n\'êtes pas le créateur de ce cours',
      });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapitre non trouvé',
      });
    }

    const newSection = new Section({
      title,
      chapterId,
      content,
      videoUrl,
      order: order || (chapter.sections.length + 1),
    });

    await newSection.save();
    chapter.sections.push(newSection._id);
    await chapter.save();

    res.status(201).json({
      success: true,
      data: newSection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la section',
      error: error.message,
    });
  }
};

// Update a section
export const updateSection = async (req, res) => {
  try {
    const { id, chapterId, sectionId } = req.params;
    const { title, content, videoUrl, order } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(chapterId) ||
      !mongoose.Types.ObjectId.isValid(sectionId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé',
      });
    }

    if (course.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé - Vous n\'êtes pas le créateur de ce cours',
      });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section non trouvée',
      });
    }

    if (title) section.title = title;
    if (content) section.content = content;
    if (videoUrl) section.videoUrl = videoUrl;
    if (order) section.order = order;

    await section.save();

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la section',
      error: error.message,
    });
  }
};

// Delete a section
export const deleteSection = async (req, res) => {
  try {
    const { id, chapterId, sectionId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(chapterId) ||
      !mongoose.Types.ObjectId.isValid(sectionId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé',
      });
    }

    if (course.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé - Vous n\'êtes pas le créateur de ce cours',
      });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapitre non trouvé',
      });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section non trouvée',
      });
    }

    await Section.deleteOne({ _id: sectionId });
    chapter.sections = chapter.sections.filter((sec) => sec.toString() !== sectionId);
    await chapter.save();

    res.status(200).json({
      success: true,
      message: 'Section supprimée avec succès',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la section',
      error: error.message,
    });
  }
};


export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de cours invalide' });
    }

    const course = await Course.findById(id)
      .populate({
        path: 'createdBy',
        select: 'prenom nom email role'
      })
      .populate({
        path: 'chapters',
        options: { sort: { order: 1 } },
        populate: [
          { 
            path: 'sections',
            options: { sort: { order: 1 } },
            select: 'title content videoUrl order duration' // Ajout de content et videoUrl
          },
          {
            path: 'quiz',
            populate: { 
              path: 'questions',
              select: 'text options explanation points' // Inclure toutes les données nécessaires
            }
          }
        ]
      });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Transformer la structure pour le frontend
    const transformedCourse = {
      ...course.toObject(),
      chapters: course.chapters.map(chapter => ({
        ...chapter.toObject(),
        quiz: chapter.quiz ? {
          ...chapter.quiz.toObject(),
          questions: chapter.quiz.questions.map(question => ({
            ...question.toObject(),
            options: question.options.map(opt => opt.text),
            correctOption: question.options.reduce((acc, opt, idx) => {
              if (opt.isCorrect) acc.push(idx);
              return acc;
            }, []),
            multipleAnswers: question.options.filter(opt => opt.isCorrect).length > 1
          }))
        } : {
          passingScore: 70,
          questions: []
        }
      }))
    };

    res.status(200).json({
      success: true,
      data: transformedCourse
    });
  } catch (error) {
    console.error('Error in getCourseById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du cours',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateSectionProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapterId, sectionId } = req.body;
    const userId = req.user.id;

    let progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      progress = new Progress({ userId, courseId, chapterProgress: [] });
    }

    let chapterProgress = progress.chapterProgress.find(
      (chap) => chap.chapterId.toString() === chapterId
    );
    if (!chapterProgress) {
      chapterProgress = { chapterId, completedSections: [], quizCompleted: false, quizScore: null };
      progress.chapterProgress.push(chapterProgress);
    }

    if (!chapterProgress.completedSections.includes(sectionId)) {
      chapterProgress.completedSections.push(sectionId);
    }

    const course = await Course.findById(courseId).populate({
      path: 'chapters',
      populate: { path: 'sections' },
    });
    const totalSections = course.chapters.reduce((sum, chap) => sum + chap.sections.length, 0);
    const completedSections = progress.chapterProgress.reduce(
      (sum, chap) => sum + chap.completedSections.length,
      0
    );
    progress.overallProgress = Math.round((completedSections / totalSections) * 100);
    progress.markModified('chapterProgress');
    console.log('PROGRESS TO SAVE:', JSON.stringify(progress, null, 2));

  //  await progress.save();
try {
  await progress.save();
} catch (saveErr) {
  console.error('Erreur lors de l\'enregistrement de la progression :', saveErr);
}

    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('Error in updateSectionProgress:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la progression' });
  }
};


export const completeQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapterId, answers } = req.body; // answers: { questionId: [selectedOptionIndices] }
    const userId = req.user.id;

    // Fetch quiz to validate answers
    const course = await Course.findById(courseId).populate({
      path: 'chapters',
      match: { _id: chapterId },
      populate: { path: 'quiz', populate: { path: 'questions' } },
    });
    const quiz = course.chapters[0]?.quiz;
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    }

    // Calculate score
    let score = 0;
    const totalQuestions = quiz.questions.length;
    quiz.questions.forEach((question, qIndex) => {
      const userAnswers = answers[question._id] || [];
      const correctIndices = question.options
        .map((opt, i) => (opt.isCorrect ? i : null))
        .filter((i) => i !== null);
      const isCorrect =
        userAnswers.length === correctIndices.length &&
        userAnswers.every((ans) => correctIndices.includes(ans));
      if (isCorrect) score += 1;
    });
    const percentageScore = Math.round((score / totalQuestions) * 100);

    // Update progress
    let progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      progress = new Progress({ userId, courseId, chapterProgress: [] });
    }

    let chapterProgress = progress.chapterProgress.find(
      (chap) => chap.chapterId.toString() === chapterId
    );
    if (!chapterProgress) {
      chapterProgress = { chapterId, completedSections: [], quizCompleted: false, quizScore: null };
      progress.chapterProgress.push(chapterProgress);
    }

    chapterProgress.quizCompleted = true;
    chapterProgress.quizScore = percentageScore;

    const courseData = await Course.findById(courseId).populate({
      path: 'chapters',
      populate: { path: 'sections' },
    });
    const totalSections = courseData.chapters.reduce((sum, chap) => sum + chap.sections.length, 0);
    const completedSections = progress.chapterProgress.reduce(
      (sum, chap) => sum + chap.completedSections.length,
      0
    );
    progress.overallProgress = Math.round((completedSections / totalSections) * 100);

    await progress.save();

    res.json({ success: true, data: { progress, score: percentageScore } });
  } catch (err) {
    console.error('Error in completeQuiz:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la soumission du quiz' });
  }
};
export const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await Progress.findOne({ userId: req.user.id, courseId });
    res.json({
      success: true,
      data: progress || { chapterProgress: [], overallProgress: 0, completed: false },
    });
  } catch (err) {
    console.error('Error in getProgress:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la progression',
    });
  }
};
export const checkSubscription = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    const isSubscribed = course.followers.includes(req.user.id);
    
    res.status(200).json({
      success: true,
      isSubscribed
    });

  } catch (err) {
    console.error('Error checking subscription:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
export const getCourseForEditing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est bien le créateur du cours
    const course = await Course.findOne({ _id: id, createdBy: userId })
      .populate({
        path: 'chapters',
        options: { sort: { order: 1 } },
        populate: [
          { 
            path: 'sections',
            options: { sort: { order: 1 } }
          },
          {
            path: 'quiz',
            populate: {
              path: 'questions',
              select: 'text options explanation'
            }
          }
        ]
      });

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cours non trouvé ou vous n\'êtes pas autorisé à le modifier' 
      });
    }

    // Transformer la structure pour le frontend
    const transformedData = {
      _id: course._id,
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      category: course.category,
      chapters: course.chapters.map(chapter => ({
        _id: chapter._id,
        title: chapter.title,
        order: chapter.order,
        sections: chapter.sections.map(section => ({
          _id: section._id,
          title: section.title,
          content: section.content,
          videoUrl: section.videoUrl,
          order: section.order
        })),
        quiz: chapter.quiz ? {
          _id: chapter.quiz._id,
          passingScore: chapter.quiz.passingScore || 70,
          questions: chapter.quiz.questions.map(question => ({
            _id: question._id,
            text: question.text,
            options: question.options.map(opt => opt.text),
            correctOption: question.options.findIndex(opt => opt.isCorrect),
            explanation: question.explanation || ''
          }))
        } : {
          passingScore: 70,
          questions: []
        }
      }))
    };

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error in getCourseForEditing:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du cours pour édition',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// controllers/courseController.js
export const getCoursesByCreator = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const courses = await Course.find({ createdBy: userId })
      .populate('createdBy', 'prenom nom')
      .populate({
        path: 'chapters',
        populate: [
          { path: 'sections' },
          { 
            path: 'quiz',
            populate: {
              path: 'questions'
            }
          }
        ]
      });

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Erreur récupération cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours',
      error: error.message
    });
  }
};