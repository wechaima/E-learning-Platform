import { Schema, model } from 'mongoose';

const progressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  chapterProgress: [{
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
    completedSections: [{ type: Schema.Types.ObjectId, ref: 'Section' }], // Store section IDs
    quizScore: { type: Number, default: null }, // Null if not attempted
    quizCompleted: { type: Boolean, default: false },
  }],
  overallProgress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

export default model('Progress', progressSchema);