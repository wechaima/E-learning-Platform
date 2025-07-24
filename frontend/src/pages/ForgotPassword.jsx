import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './auth.css';
import { FaExclamationTriangle, FaSpinner, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showPassword, setShowPassword] = useState(false); // Added showPassword state
  const navigate = useNavigate();

  // Timer for the code
  useEffect(() => {
    let interval;
    if (timer > 0 && step === 2) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-reset-code', { email, code });
      if (response.data.message === 'Code vérifié avec succès') {
        setStep(3);
      } else {
        setError(response.data.message || 'Code invalide ou expiré');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      navigate('/login', { state: { message: 'Mot de passe réinitialisé avec succès' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <header className="auth-header">
        <div className="header-content">
          <Link to="/login" className="back-button">
            <FaArrowLeft /> Retour
          </Link>
          <h1 className="logo">EduPlatform</h1>
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-card forgot-password-container">
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}></div>
          </div>

          <div className="card-header">
            {step === 1 && <h2>Mot de passe oublié</h2>}
            {step === 2 && <h2>Vérification du code</h2>}
            {step === 3 && <h2>Nouveau mot de passe</h2>}
          </div>

          {error && (
            <div className="auth-error">
              <FaExclamationTriangle className="icon" />
              <span>{error}</span>
            </div>
          )}

          <div className="step-transition">
            {step === 1 && (
              <form onSubmit={handleSendCode} className="auth-form forgot-password-form">
                <p>Entrez votre adresse email pour recevoir un code de vérification</p>
                <div className="form-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? <FaSpinner className="spinner" /> : 'Envoyer le code'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="auth-form forgot-password-form">
                <p>Nous avons envoyé un code à {email}</p>
                <div className={`timer-display ${timer <= 10 ? 'timer-warning' : ''}`}>
                  Code valide pour: {timer}s
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code à 6 chiffres"
                    required
                    maxLength="6"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || timer === 0}
                  className="submit-button"
                >
                  {loading ? <FaSpinner className="spinner" /> : 'Vérifier le code'}
                </button>
                <div className="resend-code">
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={timer > 0}
                    className="resend-button"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="auth-form forgot-password-form">
                <div className="form-group password-group">
                  <label>Nouveau mot de passe</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'} // Use showPassword state
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    required
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <div className="password-match-error">
                      Les mots de passe ne correspondent pas
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? <FaSpinner className="spinner" /> : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="global-footer">
        <p>© {new Date().getFullYear()} EduPlatform. Tous droits réservés.</p>
      </footer>
    </div>
  );
};