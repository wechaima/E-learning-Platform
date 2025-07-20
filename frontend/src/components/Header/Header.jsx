import { Link } from 'react-router-dom';
import './Header.css';
import { useNavigate } from 'react-router-dom'; 
const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); // Appel de la fonction de déconnexion parente
    navigate('/'); // Redirection vers la home page
  };
  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="EduPlatform" />
        </Link>
        
        <div className="search-bar">
          <input type="text" placeholder="Rechercher des cours..." />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
        
       <nav className="user-nav">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Mon espace</Link>
              <button onClick={handleLogout} className="nav-button">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Se connecter</Link>
              <Link to="/register" className="nav-button">S'inscrire</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;