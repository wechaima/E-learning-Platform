import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaLock, FaChalkboardTeacher, FaEye, FaEyeSlash } from 'react-icons/fa';
import './FormateurFormModal.css';

const FormateurFormModal = ({ formateur, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    specialite: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (formateur) {
      setFormData({
        nom: formateur.nom || '',
        prenom: formateur.prenom || '',
        email: formateur.email || '',
        specialite: formateur.specialite || '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        specialite: '',
        password: '',
        confirmPassword: ''
      });
    }
    setErrors({});
    setFormSubmitted(false);
  }, [formateur]);

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

    if (!formData.specialite) {
      newErrors.specialite = 'La spécialité est obligatoire';
    }

    if (!formateur) {
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
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getInputClassName = (name) => {
    if (!formSubmitted) return '';
    return errors[name] ? 'input-error' : '';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>
            {formateur ? 'Modifier le formateur' : 'Ajouter un formateur'}
          </h3>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formateur-form">
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
              placeholder="Entrez le prénom"
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
              placeholder="Entrez le nom"
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
              placeholder="Entrez l'email"
            />
            {formSubmitted && errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              <FaChalkboardTeacher className="input-icon" />
              Spécialité
            </label>
            <input
              type="text"
              name="specialite"
              value={formData.specialite}
              onChange={handleChange}
              className={getInputClassName('specialite')}
              placeholder="Entrez la spécialité"
            />
            {formSubmitted && errors.specialite && (
              <span className="error-message">{errors.specialite}</span>
            )}
          </div>

          {!formateur && (
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
                    placeholder="Entrez le mot de passe"
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
                    placeholder="Confirmez le mot de passe"
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

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-btn"
            >
              Annuler
            </button>
            <button type="submit" className="submit-btn">
              {formateur ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormateurFormModal;