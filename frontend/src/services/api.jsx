import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour injecter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Gestion des erreurs globales
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Gérer la déconnexion si le token est invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  // Authentification
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),

  // Admin
  createFormateur: (data) => api.post('/formateurs', data),
  getFormateurs: () => api.get('/formateurs'),
  deleteFormateur: (id) => api.delete(`/formateurs/${id}`),
  getEtudiants: () => api.get('/etudiants'),
  getAllCourses: () => api.get('/courses'), // Nouvelle méthode
  getAllUsers: () => api.get('/users'),    // Nouvelle méthode

  // Commun
  getProfile: () => api.get('/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};