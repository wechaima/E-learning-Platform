import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaUserShield, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './AdminFormModal.css';

function AdminFormModal({ admin, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    prenom: admin?.prenom || '',
    nom: admin?.nom || '',
    email: admin?.email || '',
    role: admin?.role || 'Admin',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (admin) {
      setFormData({
        prenom: admin.prenom || '',
        nom: admin.nom || '',
        email: admin.email || '',
        role: admin.role || 'Admin',
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        role: 'Admin',
        password: '',
        confirmPassword: ''
      });
    }
    setErrors({});
    setFormSubmitted(false);
  }, [admin]);

  const validate = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!formData.prenom) {
      newErrors.prenom = 'Le prénom est obligatoire';
    } else if (!nameRegex.test(formData.prenom)) {
      newErrors.prenom = 'Le prénom doit commencer par une lettre';
    }

    if (!formData.nom) {
      newErrors.nom = 'Le nom est obligatoire';
    } else if (!nameRegex.test(formData.nom)) {
      newErrors.nom = 'Le nom doit commencer par une lettre';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!admin) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est obligatoire';
      } else if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'La confirmation du mot de passe est obligatoire';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  const getInputClassName = (name) => {
    if (!formSubmitted) return '';
    return errors[name] ? 'input-error' : '';
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{admin ? 'Modifier mon profil' : 'Ajouter un admin'}</h2>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaUser className="input-icon" />
              Prénom
            </label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className={getInputClassName('prenom')}
            />
            {formSubmitted && errors.prenom && (
              <span className="error-message">{errors.prenom}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>
              <FaUser className="input-icon" />
              Nom
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={getInputClassName('nom')}
            />
            {formSubmitted && errors.nom && (
              <span className="error-message">{errors.nom}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>
              <FaEnvelope className="input-icon" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={getInputClassName('email')}
            />
            {formSubmitted && errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>
              <FaUserShield className="input-icon" />
              Rôle
            </label>
            {admin ? (
              <input
                type="text"
                value={formData.role}
                readOnly
                disabled
                className="disabled-input"
              />
            ) : (
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">Super Admin</option>
              </select>
            )}
          </div>
          
          {!admin && (
  <>
    <div className="form-group">
      <label>
        <FaLock className="input-icon" />
        Mot de passe
      </label>
      <div className="password-field">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={getInputClassName('password')}
        />
        <button 
          type="button" 
          className="toggle-password"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
      {formSubmitted && errors.password && (
        <span className="error-message">{errors.password}</span>
      )}
    </div>
    
    <div className="form-group">
      <label>
        <FaLock className="input-icon" />
        Confirmer le mot de passe
      </label>
      <div className="password-field">
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={getInputClassName('confirmPassword')}
        />
        <button 
          type="button" 
          className="toggle-password"
          onClick={toggleConfirmPasswordVisibility}
        >
          {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
      {formSubmitted && errors.confirmPassword && (
        <span className="error-message">{errors.confirmPassword}</span>
      )}
    </div>
  </>
)}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Annuler</button>
            <button type="submit" className="save-btn">{admin ? 'Modifier' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminFormModal;