import express from 'express';
import { 
  createCourse, 
  getAllCourses, 
  getCourseById,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';
import { authenticate, isFormateur } from '../midddleware/auth.js';


const router = express.Router();

// Routes publiques
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Routes protégées (formateur seulement)
router.post('/', authenticate, isFormateur, createCourse);
router.put('/:id', authenticate, isFormateur, updateCourse);
router.delete('/:id', authenticate, isFormateur, deleteCourse);

export default router;