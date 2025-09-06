import { Schema, model } from 'mongoose';

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: 'default-course.jpg' },
   category: { type: String, required: true },
  chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followerCount: { type: Number, default: 0 }
}, { timestamps: true });

export default model('Course', courseSchema);