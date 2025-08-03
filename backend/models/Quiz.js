import { Schema, model } from 'mongoose';

const quizSchema = new Schema({
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  passingScore: { type: Number, default: 70 }
}, { timestamps: true });

export default model('Quiz', quizSchema);