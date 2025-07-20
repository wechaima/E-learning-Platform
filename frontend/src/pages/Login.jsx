import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './auth.css';
import { FaExclamationTriangle, FaSpinner, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  
  try {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
    
    // Connexion via le contexte d'authentification
    login(res.data.user, res.data.token);

    // Redirection en fonction du rôle
    switch(res.data.user.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'formateur':
        navigate('/formateur/dashboard');
        break;
      case 'etudiant': // Note: j'ai changé 'visiteur' pour 'etudiant' pour correspondre à votre App.js
        navigate('/visiteur');
        break;
      default:
        navigate('/');
    }
    } catch (err) {
      let errorMessage = 'Email ou mot de passe incorrect';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Identifiants invalides';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Erreur de connexion au serveur';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <header className="auth-header">
        <div className="header-content">
          <Link to="/" className="back-button">
            <FaArrowLeft className="icon" />
            <span>Retour à l'accueil</span>
          </Link>
          <h1 className="logo">EduPlatform</h1>
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <div className="card-header">
            <h2>Connectez-vous à votre compte</h2>
            
          </div>

          {error && (
            <div className="auth-error">
              <FaExclamationTriangle className="icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                
                required
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Se souvenir de moi</label>
              </div>
              
              <Link to="/mot-de-passe-oublie" className="forgot-password">
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="register-link">
                Créer un compte
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