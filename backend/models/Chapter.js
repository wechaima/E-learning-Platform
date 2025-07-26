import { Schema, model } from 'mongoose';

const chapterSchema = new Schema({
  title: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  order: { type: Number, required: true }
}, { timestamps: true });

export default model('Chapter', chapterSchema);