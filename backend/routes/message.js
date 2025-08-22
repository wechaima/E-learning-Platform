import express from 'express';
import Message from '../models/Message.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import {  isFormateur, protect } from '../midddleware/auth.js';

const router = express.Router();

// Envoyer une question (étudiant)



router.post('/', async (req, res) => {
  try {
    const { courseId, chapterId, sectionId, question, email } = req.body;

    // Vérification des champs obligatoires
    if (!courseId || !question || !email) {
      return res.status(400).json({
        success: false,
        message: 'courseId, question et email sont requis',
      });
    }

    // Vérifier si l’utilisateur existe par email
    const student = await User.findOne({ email });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Trouver le cours et peupler le formateur
    const course = await Course.findById(courseId).populate('createdBy');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé',
      });
    }

    if (!course.createdBy?._id) {
      return res.status(400).json({
        success: false,
        message: 'Formateur du cours non trouvé',
      });
    }

    // Création du message
    const message = new Message({
      student: student._id,              // récupéré via email
      instructor: course.createdBy._id,  // le formateur du cours
      course: courseId,
      chapter: chapterId || null,
      section: sectionId || null,
      question,
    });

    await message.save();

    // Peupler les données pour la réponse
    await message.populate('student', 'prenom nom email');
    await message.populate('course', 'title');
    if (chapterId) {
      await message.populate('chapter', 'title');
    }

    res.status(201).json({
      success: true,
      message: 'Question envoyée avec succès',
      data: message,
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// Récupérer les messages pour un formateur
router.get('/instructor', protect, isFormateur, async (req, res) => {
  try {
    const { filter } = req.query;
    let query = { instructor: req.user._id };
    
    if (filter === 'unread') {
      query.isRead = false;
    } else if (filter === 'unanswered') {
      query.response = null;
    }
    
    const messages = await Message.find(query)
      .populate('student', 'prenom nom')
      .populate('course', 'title')
      .populate('chapter', 'title')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching instructor messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Compter les messages non lus
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Message.countDocuments({
      instructor: req.user.id,
      isRead: false
    });
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error counting unread messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Marquer un message comme lu
router.patch('/:id/read', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    if (message.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    message.isRead = true;
    await message.save();
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Répondre à un message
router.post('/:id/respond',protect, isFormateur,  async (req, res) => {
  try {
    const { response } = req.body;
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    if (message.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    message.response = response;
    message.respondedAt = new Date();
    message.isRead = true;
    
    await message.save();
    
    // Populer les informations pour la réponse
    await message.populate('student', 'prenom nom');
    await message.populate('course', 'title');
    if (message.chapter) {
      await message.populate('chapter', 'title');
    }
    
    res.json({
      success: true,
      message: 'Réponse envoyée avec succès',
      data: message
    });
  } catch (error) {
    console.error('Error responding to message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});
// Récupérer les messages d'un étudiant
router.get('/student', protect, async (req, res) => {
  try {
    const messages = await Message.find({ student: req.user.id })
      .populate('course', 'title')
      .populate('chapter', 'title')
      .populate('instructor', 'prenom nom')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching student messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});
export default router;