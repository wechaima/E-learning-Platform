import { useState } from 'react';
import { 
  FaTimes, FaUser, FaEnvelope, FaLock, FaKey, FaEye, FaEyeSlash, FaUserShield 
} from 'react-icons/fa';
import './ProfileModal.css';

function ProfileModal({ user, onClose, onUpdateProfile, onChangePassword }) {
  const [activeTab, setActiveTab] = useState('info');
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    role: user?.role || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const validateProfile = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!profileData.prenom) {
      newErrors.prenom = 'Le prénom est obligatoire';
    } else if (!nameRegex.test(profileData.prenom)) {
      newErrors.prenom = 'Le prénom doit commencer par une lettre';
    }

    if (!profileData.nom) {
      newErrors.nom = 'Le nom est obligatoire';
    } else if (!nameRegex.test(profileData.nom)) {
      newErrors.nom = 'Le nom doit commencer par une lettre';
    }

    if (!profileData.email) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!emailRegex.test(profileData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'L\'ancien mot de passe est obligatoire';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est obligatoire';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!passwordRegex.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Le mot de passe doit contenir une majuscule et un caractère spécial';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation est obligatoire';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (validateProfile()) {
      onUpdateProfile(profileData);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (validatePassword()) {
      onChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mon Profil</h2>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Informations personnelles
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Mot de passe & Sécurité
          </button>
        </div>
        
        {activeTab === 'info' ? (
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>
                <FaUser className="input-icon" />
                Prénom
              </label>
              <input
                type="text"
                name="prenom"
                value={profileData.prenom}
                onChange={handleProfileChange}
                className={errors.prenom ? 'input-error' : ''}
              />
              {errors.prenom && <span className="error-message">{errors.prenom}</span>}
            </div>
            
            <div className="form-group">
              <label>
                <FaUser className="input-icon" />
                Nom
              </label>
              <input
                type="text"
                name="nom"
                value={profileData.nom}
                onChange={handleProfileChange}
                className={errors.nom ? 'input-error' : ''}
              />
              {errors.nom && <span className="error-message">{errors.nom}</span>}
            </div>
            
            <div className="form-group">
              <label>
                <FaEnvelope className="input-icon" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label>
                <FaUserShield className="input-icon" />
                Rôle
              </label>
              <input
                type="text"
                name="role"
                value={profileData.role}
                readOnly
                disabled
                className="disabled-input"
              />
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-btn">Annuler</button>
              <button type="submit" className="save-btn">Enregistrer</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>
                <FaLock className="input-icon" />
                Ancien mot de passe
              </label>
              <div className="password-input-container">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={errors.currentPassword ? 'input-error' : ''}
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {errors.currentPassword && (
                <span className="error-message">{errors.currentPassword}</span>
              )}
            </div>
            
            <div className="form-group">
              <label>
                <FaKey className="input-icon" />
                Nouveau mot de passe
              </label>
              <div className="password-input-container">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={errors.newPassword ? 'input-error' : ''}
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {errors.newPassword && (
                <span className="error-message">{errors.newPassword}</span>
              )}
            </div>
            
            <div className="form-group">
              <label>
                <FaKey className="input-icon" />
                Confirmer le nouveau mot de passe
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-btn">Annuler</button>
              <button type="submit" className="save-btn">Modifier</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;