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
// Middleware pour la suppression en cascade
courseSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const chapters = await Chapter.find({ courseId: this._id });
    for (const chapter of chapters) {
      await chapter.deleteOne();
    }
    next();
  } catch (error) {
    next(error);
  }
});
export default model('Course', courseSchema);