import React from 'react';
import './PlatformDefinition.css';
import platformImage from '../../assets/platform-image.jpg'; 

const PlatformDefinition = () => {
  return (
    <section className="platform-definition">
      <div className="definition-container">
        <div className="definition-content">
          <h1>E-learning</h1>
          <h2>Votre passerelle vers l'expertise numérique</h2>
          <p>
            E-learning révolutionne l'apprentissage en ligne avec des formations pratiques 
            et des parcours sur-mesure dans les domaines les plus porteurs du numérique.
          </p>
          <button className="explore-button">Explorer les cours</button>
        </div>
        
        <div className="definition-image">
          <img src={platformImage} alt="Plateforme d'apprentissage en ligne" />
        </div>
      </div>
    </section>
  );
};

export default PlatformDefinition;