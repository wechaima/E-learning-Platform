import React from 'react';
import { Link } from 'react-router-dom';
import './CtaBanner.css';
import ctaImage from '../../assets/cta-image.jpg'; // Importez votre image

const CtaBanner = () => {
  return (
    <section className="cta-banner">
      <div className="cta-content-wrapper">
        {/* Colonne image */}
        <div className="cta-image-container">
          <img 
            src={ctaImage} 
            alt="Étudiant heureux utilisant notre plateforme"
            className="cta-image"
          />
        </div>
        
        {/* Colonne texte */}
        <div className="cta-text-container">
          <h2>Passez à l'étape suivante pour atteindre vos objectifs</h2>
          <p>
            Inscrivez-vous maintenant pour recevoir des recommandations personnalisées
            de notre catalogue complet.
          </p>
          <Link to="/register" className="cta-button">
            Inscrivez-vous gratuitement
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;