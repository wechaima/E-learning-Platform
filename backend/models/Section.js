import { Schema, model } from 'mongoose';

const sectionSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: String,
  description: String,
  videoUrl: String // facultatif
});

export default model('Section', sectionSchema);
