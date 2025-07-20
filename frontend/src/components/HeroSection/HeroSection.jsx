import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Des compétences d'aujourd'hui qui ont de l'avenir</h1>
        <p>Notre différence ? Une école 100% en ligne et un modèle pédagogique unique qui seront les clés de votre réussite.</p>
        
        <div className="cta-container">
          <div className="cta-card">
            <h2>Étudiants</h2>
            <p>Faites un grand pas vers votre nouvelle carrière en suivant l'une de nos formations diplômantes.</p>
            <div className="cta-buttons">
              <button className="primary-button">Démarrer mon inscription</button>
              <button className="secondary-button">Découvrir les formations</button>
            </div>
          </div>
          
          <div className="cta-card">
            <h2>Employeurs</h2>
            <p>Recrutez des alternants qui créent de la valeur rapidement et formez vos équipes à des compétences opérationnelles.</p>
            <div className="cta-buttons">
              <button className="primary-button">Explorer l'espace employeur</button>
              <button className="secondary-button">Découvrir nos solutions</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;