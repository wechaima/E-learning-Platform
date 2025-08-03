import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const initAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'superadmin' });
    if (!adminExists) {
      const admin = new User({
        nom: 'superadmin',
        prenom: 'System',
        email: process.env.ADMIN_EMAIL || 'superadmin@ecole.com',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
        role: 'superadmin'
      });
      await admin.save();
      console.log('✅ Compte superadmin créé avec succès');
    }
  } catch (err) {
    console.error('❌ Erreur création superadmin:', err.message);
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
    // 1. Vérification de l'utilisateur
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // 2. Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // 3. Génération du token
    const token = jwt.sign(
      { 
        id: user._id, // Gardez la même clé que dans le middleware
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // 4. Réponse
    res.json({
      success: true,
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
    console.error('Erreur login:', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export const createAdmin = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;
    
    // Vérifier que l'utilisateur qui fait la requête est superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).send({ error: 'Seul un superadmin peut créer un admin' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    
    await admin.save();
    res.status(201).send({ admin });
  } catch (error) {
    res.status(400).send(error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw new ApiError(404, 'Utilisateur non trouvé');
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false,
      message: error.message || 'Erreur serveur'
    });
  }
};

// Mettre à jour le profil de l'utilisateur connecté
export const updateProfile = async (req, res) => {
  try {
    const { prenom, nom, email } = req.body;
    const userId = req.user.id;

    // Validation des champs
    if (!prenom || !nom || !email) {
      throw new ApiError(400, 'Tous les champs sont obligatoires');
    }

    // Vérifier si l'email existe déjà pour un autre utilisateur
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new ApiError(400, 'Cet email est déjà utilisé');
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { prenom, nom, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Profil mis à jour avec succès',
      data: updatedUser 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false,
      message: error.message || 'Erreur serveur'
    });
  }
};


// Configuration du transporteur email (à adapter avec vos infos SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Demande de réinitialisation
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Aucun utilisateur avec cet email" });
    }

    // Générer un code PIN de 6 chiffres
    const pin = crypto.randomInt(100000, 999999).toString();
    const expires = Date.now() + 60000; // 60 secondes

    user.resetPasswordToken = pin;
    user.resetPasswordExpires = expires;
    await user.save();

    // Envoyer l'email
    const mailOptions = {
      to: user.email,
      from: { name: 'Eduplatforme', address: process.env.EMAIL_USER }, // Updated to use name and address
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Votre code de vérification est: <strong>${pin}</strong></p>
        <p>Ce code expirera dans 60 secondes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: "Un code de vérification a été envoyé à votre email",
      email: user.email // Renvoyer l'email pour les étapes suivantes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vérification du code PIN
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await User.findOne({ 
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Code invalide ou expiré",
        details: {
          emailExists: !!await User.findOne({ email }),
          codeMatches: !!await User.findOne({ email, resetPasswordToken: code }),
          codeNotExpired: !!await User.findOne({ email, resetPasswordExpires: { $gt: Date.now() } })
        }
      });
    }

    res.status(200).json({ 
      message: "Code vérifié avec succès",
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Réinitialisation du mot de passe
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Effacer le token de réinitialisation
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};