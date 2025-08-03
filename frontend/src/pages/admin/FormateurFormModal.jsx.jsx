import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaLock, FaChalkboardTeacher } from 'react-icons/fa';
import './FormateurFormModal.css';

const FormateurFormModal = ({ formateur, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    specialite: '',
    password: ''
  });

  useEffect(() => {
    if (formateur) {
      setFormData({
        nom: formateur.nom || '',
        prenom: formateur.prenom || '',
        email: formateur.email || '',
        specialite: formateur.specialite || '',
        password: ''
      });
    }
  }, [formateur]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
              required
              placeholder="Entrez le prénom"
            />
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
              required
              placeholder="Entrez le nom"
            />
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
              required
              placeholder="Entrez l'email"
            />
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
              required
              placeholder="Entrez la spécialité"
            />
          </div>

          {!formateur && (
            <div className="form-group">
              <label>
                <FaLock className="input-icon" />
                Mot de passe
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Entrez le mot de passe"
              />
            </div>
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