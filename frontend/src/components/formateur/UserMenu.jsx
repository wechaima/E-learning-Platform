import React from 'react';
import { Link } from 'react-router-dom';

const UserMenu = ({ onLogout }) => {
  return (
    <div className="user-menu">
      <div className="menu-item">
        <Link to="/profile">Mon Profil</Link>
      </div>
      <div className="menu-item" onClick={onLogout}>
        Déconnexion
      </div>
    </div>
  );
};

export default UserMenu;