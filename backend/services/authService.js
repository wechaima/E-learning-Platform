// services/authService.js
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User.js';

// Promisify jwt functions for async/await
const signToken = promisify(jwt.sign);

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - L'utilisateur pour lequel générer le token
 * @returns {Promise<string>} Le token JWT
 */
export const generateToken = async (user) => {
  try {
    if (!user?._id || !user?.role) {
      throw new Error('User object is missing required properties');
    }

    const payload = {
      id: user._id.toString(), // Standardisation sur 'id'
      role: user.role,
      // Ajouter d'autres claims si nécessaire
    };

    const token = await signToken(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Le token JWT à vérifier
 * @returns {Promise<Object>} Le payload décodé
 */
export const verifyToken = async (token) => {
  try {
    const verify = promisify(jwt.verify);
    return await verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw error;
  }
};

/**
 * Authentifie un utilisateur et retourne les tokens
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: Object, token: string}>}
 */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const token = await generateToken(user);
  
  return {
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    token
  };
};