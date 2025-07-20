import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String },
  duration: { type: Number } // en minutes
}, { _id: true });

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  points: { type: Number, default: 1 }
}, { _id: true });

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [QuestionSchema],
  passingScore: { type: Number, default: 70 }
}, { _id: true });

const CourseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true
  },
  formateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['développement', 'design', 'marketing', 'business'],
    required: true
  },
  sections: [SectionSchema],
  quiz: QuizSchema,
  thumbnail: {
    type: String,
    default: 'default-course.jpg'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

// Index pour les recherches
CourseSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Course', CourseSchema);