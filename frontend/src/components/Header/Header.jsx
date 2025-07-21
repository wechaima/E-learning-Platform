import { Link } from 'react-router-dom';
import './Header.css';
import { useNavigate } from 'react-router-dom'; 
import { FaSearch } from 'react-icons/fa';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <span className="logo-text">EduPlatform</span>
        </Link>
        
        <div className="search-container">
          <div className="search-bar">
            <input type="text" placeholder="Rechercher des cours..." />
            <button className="search-button">
              <FaSearch />
            </button>
          </div>
        </div>
        
        <nav className="user-nav">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Mon espace</Link>
              <button onClick={handleLogout} className="nav-button">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button login-button">Se connecter</Link>
              <Link to="/register" className="nav-button">S'inscrire</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;