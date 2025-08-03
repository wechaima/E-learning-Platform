import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  text: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export default model('Question', questionSchema);