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
    login(res.data.user, res.data.token);

    // Debug: Vérifiez les données reçues
    console.log('User role:', res.data.user.role);
    
    const role = res.data.user.role.toLowerCase();

if (role === 'admin' || role === 'superadmin') {
  navigate('/admin');
} else if (role === 'formateur') {
  navigate('/formateur/dashboard');
} else if (role === 'etudiant') {
  navigate('/etudiant');
} else {
  navigate('/');
}

    }
   catch (err) {
    // Gestion d'erreur...
  }
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                  autoComplete="username"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  autoComplete="current-password"
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