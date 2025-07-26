
/**
 * Middleware d'authentification générique avec contrôle de rôle
 * @param {string} requiredRole - Le rôle requis pour accéder à la ressource
 * @returns {function} Middleware Express
 */
// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Course from '../models/Course.js';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware d'authentification de base
 * Vérifie le token et attache l'utilisateur à la requête
 */
// middleware/auth.js
// middleware/auth.js
export const authenticate = (req, res, next) => {
  // Extraction optionnelle du token (utilisation de l'opérateur ?.)
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Si pas de token, retourne une erreur 401
  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }

  try {
    // Vérification et décodage du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajout des infos utilisateur à la requête
    req.user = decoded;
    
    // Passage au middleware suivant
    next();
  } catch (err) {
    // Gestion des erreurs de token
    res.status(401).json({ message: 'Token invalide' });
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Token manquant'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Non autorisé - Token invalide',
      error: error.message
    });
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Seul un superadmin peut effectuer cette action'
    });
  }
  next();
};
export const isFormateur = (req, res, next) => {
  if (req.user?.role !== 'formateur') {
    return res.status(403).json({
      message: 'Accès refusé. Seuls les formateurs peuvent effectuer cette action'
    });
  }
  next();
};
export const isEtudiant = (req, res, next) => {
  if (req.user?.role !== 'etudiant') {
    return res.status(403).json({
      message: 'Accès refusé. Seuls les etudaints peuvent effectuer cette action'
    });
  }
  next();
};
export const isAdminOrSuperAdmin = (req, res, next) => {
  const role = req.user?.role;

  if (role !== 'admin' && role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: "Accès refusé. Seuls les administrateurs peuvent effectuer cette action."
    });
  }

  next();
};
export const isAdmin = (req, res, next) => {
  // Vérifie si l'utilisateur a le rôle 'admin'
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé - Admin requis' });
  }
  
  next();
};

/**
 * Middleware générique de contrôle de rôle
 * @param {...string} roles - Rôles autorisés
 * @returns {function} Middleware Express
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Accès refusé - Rôle(s) autorisé(s): ${roles.join(', ')}`)
      );
    }
    next();
  };
};

/**
 * Middlewares spécifiques par rôle (pour plus de commodité)
 */

export const isAdminOrFormateur = authorize('superadmin', 'admin', 'formateur');

/**
 * Vérifie que l'utilisateur est propriétaire du cours
 */
export const isCourseOwner = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return next(new ApiError(404, 'Cours non trouvé'));
    }

    if (course.createdBy.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Vous n\'êtes pas le propriétaire de ce cours'));
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware pour vérifier la propriété ou les droits admin
 */
export const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return next(new ApiError(404, 'Cours non trouvé'));
    }

    const isOwner = course.createdBy.toString() === req.user._id.toString();
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return next(new ApiError(403, 'Action non autorisée'));
    }
    
    next();
  } catch (error) {
    next(error);
  }
};





