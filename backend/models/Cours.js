import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const CourseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire']
  },
  formateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: {
      values: ['développement', 'design', 'marketing', 'business'],
      message: 'Catégorie non valide'
    },
    required: true
  },
  thumbnail: {
    type: String,
    required: true,
    default: 'default-course.jpg',
    validate: {
      validator: function(v) {
        // Soit c'est l'image par défaut, soit une URL valide
        return v === 'default-course.jpg' || 
               /^uploads\/gallery\/[a-f0-9-]+\.(jpg|jpeg|png)$/i.test(v);
      },
      message: props => `${props.value} n'est pas une image valide!`
    }
  },
  gallery: [ImageSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour la recherche
CourseSchema.index({ title: 'text', description: 'text' });

// Virtual pour l'URL complète de la thumbnail
CourseSchema.virtual('thumbnailUrl').get(function() {
  if (this.thumbnail === 'default-course.jpg') {
    return `/uploads/default/${this.thumbnail}`;
  }
  return `/${this.thumbnail}`;
});

export default mongoose.model('Course', CourseSchema);