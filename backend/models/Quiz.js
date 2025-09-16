import { Schema, model } from 'mongoose';

const quizSchema = new Schema({
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  passingScore: { type: Number, default: 70 }
}, { timestamps: true });
// Middleware pour la suppression en cascade
quizSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    await Question.deleteMany({ quizId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});
export default model('Quiz', quizSchema);