import { Schema, model } from 'mongoose';

const sectionSchema = new Schema({
  title: { type: String, required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  content: { type: String },
 videoUrl: {
  type: String,
  required: function () {
    return this.type === 'video'; // obligatoire uniquement pour les vidéos
  }
},
  order: { type: Number, required: true }
}, { timestamps: true });

export default model('Section', sectionSchema);