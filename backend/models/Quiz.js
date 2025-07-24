import { Schema, model } from 'mongoose';

const quizSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }]
});

export default model('Quiz', quizSchema);
