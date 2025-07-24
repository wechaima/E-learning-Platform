import { Schema, model } from 'mongoose';

const progressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0 }, // % de progression
  score: { type: Number, default: 0 },    // score du quiz
  completed: { type: Boolean, default: false }
});

export default model('Progress', progressSchema);
