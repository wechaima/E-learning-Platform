import React, { useState } from 'react';
import './AdminFormModal.css';

function AdminFormModal({ admin, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    prenom: admin?.prenom || '',
    nom: admin?.nom || '',
    email: admin?.email || '',
    role: admin?.role || 'Admin',
    password: '', // Required for new admins, optional for updates
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{admin ? 'Modifier Admin' : 'Ajouter un Admin'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Rôle</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Admin">Admin</option>
              <option value="SuperAdmin">Super Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mot de passe {admin ? '(Laisser vide pour ne pas changer)' : '(Requis)'}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!admin}
            />
          </div>
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