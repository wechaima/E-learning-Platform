import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';

// controllers/authController.js
export const createAdmin = async (req, res) => {
  try {
    const { nom, prenom, email, password, confirmPassword } = req.body;

    // Validation des champs
    if (!nom || !prenom || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Tous les champs sont obligatoires' 
      });
    }

    // Validation du nom et prénom (doivent commencer par une lettre)
    const nameRegex = /^[a-zA-Z]/;
    if (!nameRegex.test(nom) ){
      return res.status(400).json({ 
        success: false,
        message: 'Le nom doit commencer par une lettre' 
      });
    }
    if (!nameRegex.test(prenom)) {
      return res.status(400).json({ 
        success: false,
        message: 'Le prénom doit commencer par une lettre' 
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Format d\'email invalide' 
      });
    }

    // Vérifier si l'email existe déjà
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: 'Email déjà utilisé' 
      });
    }

    // Validation du mot de passe
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Les mots de passe ne correspondent pas' 
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial' 
      });
    }

    // Créer le nouvel admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({
      success: true,
      admin: {
        id: admin._id,
        nom: admin.nom,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
export const getAllAdmins = async (req, res) => {
  try {
    // Vérifier que l'utilisateur qui fait la requête est au moins admin
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).send({ error: 'Accès refusé' });
    }
    
    const admins = await User.find({ role: { $in: ['superadmin', 'admin'] } });
    res.send(admins);
  } catch (error) {
    res.status(500).send(error);
  }
};
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role, password } = req.body;

    // Vérifier l'autorisation
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Vérifier si l'admin existe
    const admin = await User.findById(id);
    if (!admin || !['superadmin', 'admin'].includes(admin.role)) {
      return res.status(404).json({ message: 'Admin non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== admin.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }
    }

    // Mettre à jour les champs
    admin.nom = nom || admin.nom;
    admin.prenom = prenom || admin.prenom;
    admin.email = email || admin.email;
    admin.role = role || admin.role;

    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        nom: admin.nom,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier l'autorisation (seul un superadmin peut supprimer)
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    // Vérifier si l'admin existe
    const admin = await User.findById(id);
    if (!admin || !['superadmin', 'admin'].includes(admin.role)) {
      return res.status(404).json({ message: 'Admin non trouvé' });
    }

    // Vérifier si c'est le seul superadmin (prévenir la suppression)
    const superAdmins = await User.countDocuments({ role: 'superadmin' });
    if (admin.role === 'superadmin' && superAdmins <= 1) {
      return res.status(400).json({ message: 'Impossible de supprimer : Il doit y avoir au moins un superadmin' });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Admin supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};