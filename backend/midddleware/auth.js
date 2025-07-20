// Importation du module jsonwebtoken pour gérer les JWT (JSON Web Tokens)
import jwt from 'jsonwebtoken';

/**
 * Middleware d'authentification générique avec contrôle de rôle
 * @param {string} requiredRole - Le rôle requis pour accéder à la ressource
 * @returns {function} Middleware Express
 */
export const auth = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // 1. Extraction du token depuis les en-têtes de la requête
      const token = req.header('Authorization').replace('Bearer ', '');
      
      // 2. Vérification et décodage du token avec la clé secrète
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 3. Vérification du rôle si un rôle est requis
      if (requiredRole && decoded.role !== requiredRole) {
        throw new Error('Permissions insuffisantes');
      }
      
      // 4. Ajout des informations utilisateur décodées à l'objet req
      req.user = decoded;
      
      // 5. Passage au middleware suivant
      next();
    } catch (err) {
      // Gestion des erreurs (token invalide, expiration, etc.)
      res.status(401).json({ 
        message: 'Authentification requise',
        error: err.message 
      });
    }
  };
};

/**
 * Middleware d'authentification de base
 * Vérifie simplement la présence et la validité du token
 */
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

/**
 * Middleware de vérification de rôle admin
 * Doit être utilisé APRÈS le middleware d'authentification
 */
export const isAdmin = (req, res, next) => {
  // Vérifie si l'utilisateur a le rôle 'admin'
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé - Admin requis' });
  }
  
  // Si tout est OK, passe au middleware suivant
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