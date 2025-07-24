import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './auth.css';
import { FaExclamationTriangle, FaSpinner, FaEye, FaEyeSlash, FaArrowLeft, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', formData);
      navigate('/login', { state: { successMessage: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.' } });
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <header className="auth-header">
        <div className="header-content">
          
          <h1 className="logo">EduPlatform</h1>
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <div className="card-header">
            <h2>Créez votre compte</h2>
           
          </div>

          {error && (
            <div className="auth-error">
              <FaExclamationTriangle className="icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="prenom">
                <FaUser className="input-icon" />
                Prénom
              </label>
              <input
                id="prenom"
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="nom">
                <FaUser className="input-icon" />
                Nom
              </label>
              <input
                id="nom"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
               
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" />
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
               
                required
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">
                <FaLock className="input-icon" />
                Mot de passe
              </label>
              <div className="password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <FaEye/> : <FaEyeSlash  />}
                </button>
              </div>
              <p className="password-hint">Minimum 6 caractères</p>
            </div>

            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  <span>Création en cours...</span>
                </>
              ) : (
                'Créer un compte'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="login-link">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="global-footer">
        <p>© {new Date().getFullYear()} EduPlatform. Tous droits réservés.</p>
      </footer>
    </div>
  );
}