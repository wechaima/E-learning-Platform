import React from 'react';
import { FaTimes, FaUsers, FaChalkboardTeacher, FaHome, FaCog, FaUserShield } from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ 
  activeTab, 
  setActiveTab, 
  open = false, 
  onClose = () => {} 
}) => {
  return (
    <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">EduAdmin</div>
        <button 
          className="close-sidebar"
          onClick={onClose}
          aria-label="Fermer le menu"
        >
          <FaTimes />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('home');
            onClose();
          }}
        >
          <FaHome className="nav-icon" />
          Tableau de bord
        </button>
        
        <button
          className={`nav-item ${activeTab === 'formateurs' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('formateurs');
            onClose();
          }}
        >
          <FaChalkboardTeacher className="nav-icon" />
          Formateurs
        </button>
        
        <button
          className={`nav-item ${activeTab === 'etudiants' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('etudiants');
            onClose();
          }}
        >
          <FaUsers className="nav-icon" />
          Étudiants
        </button>
        
        <button
          className={`nav-item ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('admins');
            onClose();
          }}
        >
          <FaUserShield className="nav-icon" />
          Admins
        </button>
        
        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('settings');
            onClose();
          }}
        >
          <FaCog className="nav-icon" />
          Paramètres
        </button>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">AD</div>
          <div className="user-info">
            <div className="user-name">Admin</div>
            <div className="user-role">Administrateur</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;