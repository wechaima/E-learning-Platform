import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>POUR LES ÉTUDIANTS</h3>
          <ul>
            <li>Formations diplômantes</li>
            <li>Cours</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>POUR LES EMPLOYEURS</h3>
          <ul>
            <li>Solutions de formations et recrutement</li>
            <li>Développer les connaissances</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>AIDE</h3>
          <ul>
            <li>Nous contacter</li>
            <li>FAQ étudiants 😊</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>LANGUE</h3>
          <select>
            <option>Français</option>
            <option>English</option>
          </select>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} EduPlatform. Tous droits réservés.</p>
        <p>38°C - {new Date().toLocaleDateString()}</p>
      </div>
    </footer>
  );
};

export default Footer;