import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  text: String,
  options: [
    {
      text: String,
      isCorrect: Boolean
    }
  ]
});

export default model('Question', questionSchema);
