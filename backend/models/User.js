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
    enum: ['superadmin', 'admin', 'formateur', 'etudiant'],
    default: 'etudiant'
  },
  specialite: { type: String }, // Pour les formateurs
   resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });


export default mongoose.model('User', UserSchema);