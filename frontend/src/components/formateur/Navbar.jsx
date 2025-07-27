import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import UserMenu from './UserMenu';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courses?search=${searchQuery}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">E-Learning Platform</Link>
      </div>
      
      {user && (
        <div className="navbar-search">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      )}
      
      <div className="navbar-actions">
        {user ? (
          <div className="user-profile" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <img 
              src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name} 
              alt={user.name} 
              className="avatar"
            />
            {isMenuOpen && <UserMenu onLogout={logout} />}
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">Connexion</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;