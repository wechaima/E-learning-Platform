import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'formateur', 'etudiant'],
    default: 'etudiant',
    validate: {
      validator: async function(v) {
        if (v === 'admin') {
          const existingAdmin = await mongoose.model('User').findOne({ role: 'admin' });
          return !existingAdmin;
        }
        return true;
      },
      message: 'Un seul compte admin est autorisé'
    }
  },
  specialite: { type: String } // Pour les formateurs
}, { timestamps: true });

// Empêche la modification du rôle admin
UserSchema.pre('save', function(next) {
  if (this.isModified('role') && this._originalRole === 'admin') {
    throw new Error('Modification du rôle admin interdite');
  }
  next();
});

export default mongoose.model('User', UserSchema);