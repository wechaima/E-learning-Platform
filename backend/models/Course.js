import { Schema, model } from 'mongoose';

const courseSchema = new Schema({
  title: String,
  description: String,
  imageUrl: String,
  category: { type: String, required: true }, // 🆕 Ajout de catégorie
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' }
});

export default model('Course', courseSchema);
