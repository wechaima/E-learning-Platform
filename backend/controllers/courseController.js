import Course from '../models/Cours.js';
import User from '../models/User.js';

// Créer un nouveau cours (formateur seulement)
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, sections, quiz } = req.body;
    
    const newCourse = new Course({
      title,
      description,
      formateur: req.user.id, // ID du formateur depuis le token
      category,
      sections,
      quiz
    });

    const savedCourse = await newCourse.save();
    
    // Populate pour afficher les infos du formateur
    const courseWithFormateur = await Course.findById(savedCourse._id)
      .populate('formateur', 'nom prenom email');

    res.status(201).json({
      success: true,
      data: courseWithFormateur
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du cours',
      error: error.message
    });
  }
};

// Récupérer tous les cours avec infos formateur
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('formateur', 'nom prenom email')
      .select('-sections -quiz'); // Exclut les données lourdes pour la liste

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

// Récupérer un cours spécifique avec détails complets
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('formateur', 'nom prenom email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};