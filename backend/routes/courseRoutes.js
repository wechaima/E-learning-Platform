import express from 'express';
import {
 
  followCourse,
  getCourseWithProgress,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getFollowedCourses,
  createSection,
  updateSection,
  deleteSection,
  
  updateChapter,
  deleteChapter,
  getCourseDetails,
  updateSectionProgress,
  completeQuiz,
  getProgress,
  createCourse,
  createChapter,
  checkSubscription,

  getCoursesByCreator,
  getCourseForEditing,
 
  
  
} from '../controllers/courseController.js';

import {  authenticate, isEtudiant, isFormateur, protect } from '../midddleware/auth.js';

const router = express.Router();


router.get('/:id', authenticate, getCourseById);
router.post('/:courseId/sections', authenticate, updateSectionProgress);
router.post('/:courseId/quizzes', authenticate, completeQuiz);
router.get('/:courseId/progress', authenticate, getProgress);
// Routes publiques
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
// routes/courseRoutes.js
router.get('/:id', getCourseDetails);
// Routes protégées
router.use(protect);

// Routes étudiant
router.post('/:courseId/follow',isEtudiant, followCourse);
router.get('/:courseId/progress', isEtudiant, getCourseWithProgress);
// Récupérer les cours suivis par un utilisateur
// Mettre à jour la progression d'une section
router.post('/:courseId/sections', authenticate , isEtudiant, updateSectionProgress);
// Dans votre fichier de routes (ex: courseRoutes.js)
router.get('/:id/check-subscription', authenticate, isEtudiant, checkSubscription);
// Marquer un quiz comme complété
router.post('/:courseId/quizzes/',authenticate ,isEtudiant, completeQuiz);




// GET /api/users/:userId/followed-courses
router.get('/:userId/followed-courses', isEtudiant,getFollowedCourses);
// Routes formateur

router.post('/',isFormateur, createCourse);
router.put('/:id',isFormateur, updateCourse);
router.delete('/:id', isFormateur,deleteCourse);
// Chapter routes
router.post('/:id/chapters', isFormateur, createChapter);
router.put('/:id/chapters/:chapterId', isFormateur, updateChapter);
router.delete('/:id/chapters/:chapterId', isFormateur, deleteChapter);
// ... existing imports and routes ...

// Section routes
router.post('/:id/chapters/:chapterId/sections', isFormateur, createSection);
router.put('/:id/chapters/:chapterId/sections/:sectionId', isFormateur, updateSection);
router.delete('/:id/chapters/:chapterId/sections/:sectionId', isFormateur, deleteSection);
router.get('/created-by/:userId', isFormateur, getCoursesByCreator);
router.get('/:id/edit', isFormateur, getCourseForEditing );
export default router;