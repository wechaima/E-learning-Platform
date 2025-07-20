import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Initialisation du compte admin (à exécuter une fois)
export const initAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        nom: 'Admin',
        prenom: 'System',
        email: process.env.ADMIN_EMAIL || 'admin@ecole.com',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Compte admin créé avec succès');
    }
  } catch (err) {
    console.error('❌ Erreur création admin:', err.message);
  }
};

// Inscription étudiant
export const register = async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role: 'etudiant' // Toujours étudiant pour cette route
    });

    await user.save();
    res.status(201).json({
      message: 'Compte étudiant créé.',
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Cet email est déjà utilisé' });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

// Création formateur (Admin seulement)
export const createFormateur = async (req, res) => {
  const { nom, prenom, email, password, specialite } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const formateur = new User({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role: 'formateur',
      specialite
    });

    await formateur.save();
    res.status(201).json({
      message: 'Formateur créé.',
      formateur: {
        id: formateur._id,
        nom: formateur.nom,
        prenom: formateur.prenom,
        email: formateur.email,
        role: formateur.role,
        specialite: formateur.specialite
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Cet email est déjà utilisé' });
    } else if (err.message.includes('Un seul compte admin')) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

// Connexion
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Identifiants incorrects" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Identifiants incorrects" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        specialite: user.specialite
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};