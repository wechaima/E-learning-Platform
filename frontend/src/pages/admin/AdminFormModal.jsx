import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaUserShield } from 'react-icons/fa';
import './AdminFormModal.css';

function AdminFormModal({ admin, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    prenom: admin?.prenom || '',
    nom: admin?.nom || '',
    email: admin?.email || '',
    role: admin?.role || 'Admin',
    password: '', // Required for new admins, optional for updates
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        prenom: admin.prenom || '',
        nom: admin.nom || '',
        email: admin.email || '',
        role: admin.role || 'Admin',
        password: '', // Empty for updates
      });
    } else {
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        role: 'Admin',
        password: '',
      });
    }
  }, [admin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{admin ? 'Modifier Admin' : 'Ajouter un Admin'}</h2>
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
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required={!admin} // Required only for new admins
            >
              <option value="Admin">Admin</option>
              <option value="SuperAdmin">Super Admin</option>
            </select>
          </div>
          {!admin && (
            <div className="form-group">
              <label>
                <FaUserShield className="input-icon" />
                Mot de passe (Requis)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
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