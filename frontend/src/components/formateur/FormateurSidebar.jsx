// FormateurSidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaChalkboardTeacher, FaChartBar, FaSignOutAlt } from 'react-icons/fa';

const FormateurSidebar = ({ user, onLogout }) => {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <div className="avatar">{user.prenom.charAt(0)}{user.nom.charAt(0)}</div>
          <div>
            <h3>{user.prenom} {user.nom}</h3>
            <p className="role-badge formateur">Formateur</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link to="/formateur/dashboard" className="nav-item active">
          <FaBook className="nav-icon" />
          Mes cours
        </Link>
        <Link to="/formateur/students" className="nav-item">
          <FaChalkboardTeacher className="nav-icon" />
          Étudiants
        </Link>
        <Link to="/formateur/stats" className="nav-item">
          <FaChartBar className="nav-icon" />
          Statistiques
        </Link>
      </nav>

      <button onClick={onLogout} className="logout-btn">
        <FaSignOutAlt className="icon" />
        Déconnexion
      </button>
    </aside>
  );
};

export default FormateurSidebar;