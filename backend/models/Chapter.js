import { Schema, model } from 'mongoose';

const chapterSchema = new Schema({
  title: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  order: { type: Number, required: true }
}, { timestamps: true });
// Middleware pour la suppression en cascade
chapterSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    await Section.deleteMany({ chapterId: this._id });
    await Quiz.deleteOne({ chapterId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});
export default model('Chapter', chapterSchema);