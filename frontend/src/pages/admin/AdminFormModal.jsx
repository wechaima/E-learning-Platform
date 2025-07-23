import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaUserShield } from 'react-icons/fa';
import './AdminFormModal.css';

function AdminFormModal({ admin, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    prenom: admin?.prenom || '',
    nom: admin?.nom || '',
    email: admin?.email || '',
    role: admin?.role || 'Admin',
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        prenom: admin.prenom || '',
        nom: admin.nom || '',
        email: admin.email || '',
        role: admin.role || 'Admin',
      });
    } else {
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        role: 'Admin',
      });
    }
  }, [admin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
              required
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
            />
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
                required
              >
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">Super Admin</option>
              </select>
            )}
          </div>
          {!admin && (
            <div className="form-group">
              <label>
                <FaUser className="input-icon" />
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                required
              />
            </div>
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