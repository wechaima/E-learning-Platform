import React from 'react';
import { 
  FaTimes, 
  FaUsers, 
  FaChalkboardTeacher, 
  FaHome, 
  FaCog, 
  FaUserShield,
  FaChartBar // Ajoutez cette importation
} from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ 
  activeTab, 
  setActiveTab, 
  open = false, 
  onClose = () => {},
  userProfile
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
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('dashboard');
            onClose();
          }}
        >
          <FaChartBar className="nav-icon" />
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
          <div className="user-avatar">
            {userProfile?.prenom?.charAt(0)}{userProfile?.nom?.charAt(0)}
          </div>
          <div className="user-info">
            <div className="user-name">
              {userProfile?.prenom} {userProfile?.nom}
            </div>
            <div className="user-role">
              {userProfile?.role === 'superadmin' ? 'Super Admin' : 'Administrateur'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;