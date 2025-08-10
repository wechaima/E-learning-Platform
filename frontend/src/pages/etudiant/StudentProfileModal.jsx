import React, { useState } from 'react';
import { 
  FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBook, FiAward, FiBarChart2 
} from 'react-icons/fi';
import './StudentProfileModal.css';

function StudentProfileModal({ user, progressStats, onClose, onUpdateProfile, onChangePassword }) {
  const [activeTab, setActiveTab] = useState('info');
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || ''
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
    if (!profileData.prenom) newErrors.prenom = 'Le prénom est obligatoire';
    if (!profileData.nom) newErrors.nom = 'Le nom est obligatoire';
    if (!profileData.email) newErrors.email = 'L\'email est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Ancien mot de passe requis';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Nouveau mot de passe requis';
    } else if (!passwordRegex.test(passwordData.newPassword)) {
      newErrors.newPassword = '8 caractères min, 1 majuscule, 1 caractère spécial';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
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
      onChangePassword(passwordData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mon Profil</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <FiUser /> Informations
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <FiBarChart2 /> Statistiques
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <FiLock /> Mot de passe
          </button>
        </div>
        
        {activeTab === 'info' ? (
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label><FiUser /> Prénom</label>
              <input
                type="text"
                name="prenom"
                value={profileData.prenom}
                onChange={handleProfileChange}
                className={errors.prenom ? 'input-error' : ''}
              />
              {errors.prenom && <span className="error">{errors.prenom}</span>}
            </div>
            
            <div className="form-group">
              <label><FiUser /> Nom</label>
              <input
                type="text"
                name="nom"
                value={profileData.nom}
                onChange={handleProfileChange}
                className={errors.nom ? 'input-error' : ''}
              />
              {errors.nom && <span className="error">{errors.nom}</span>}
            </div>
            
            <div className="form-group">
              <label><FiMail /> Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Annuler
              </button>
              <button type="submit" className="save-btn">
                Enregistrer
              </button>
            </div>
          </form>
        ) : activeTab === 'stats' ? (
          <div className="stats-container">
            <div className="stat-card">
              <FiBook className="stat-icon" />
              <div>
                <h4>Cours suivis</h4>
                <p>{progressStats.totalCourses || 0}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <FiAward className="stat-icon" />
              <div>
                <h4>Cours terminés</h4>
                <p>{progressStats.completedCourses || 0}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <FiBarChart2 className="stat-icon" />
              <div>
                <h4>Moyenne quiz</h4>
                <p>{progressStats.averageScore ? `${progressStats.averageScore}%` : 'N/A'}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label><FiLock /> Ancien mot de passe</label>
              <div className="password-input">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={errors.currentPassword ? 'input-error' : ''}
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
            </div>
            
            <div className="form-group">
              <label><FiLock /> Nouveau mot de passe</label>
              <div className="password-input">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={errors.newPassword ? 'input-error' : ''}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.newPassword && <span className="error">{errors.newPassword}</span>}
            </div>
            
            <div className="form-group">
              <label><FiLock /> Confirmation</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Annuler
              </button>
              <button type="submit" className="save-btn">
                Modifier
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default StudentProfileModal;