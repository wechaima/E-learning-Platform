import React from 'react';
import './AboutSection.css';
import { FaGlobe, FaChartLine, FaUserTie, FaClock, FaFreeCodeCamp, FaCompass } from 'react-icons/fa';

const AboutSection = () => {
  const features = [
    {
      icon: <FaGlobe size={40} color="#6a1b9a" />,
      title: "Apprenez où que vous soyez",
      description: "Formation 100% en ligne accessible partout"
    },
    {
      icon: <FaChartLine size={40} color="#6a1b9a" />,
      title: "Suivi de progression",
      description: "Quiz et tableau de bord pour vos avancées"
    },
    {
      icon: <FaUserTie size={40} color="#6a1b9a" />,
      title: "Experts du Secteur",
      description: "Accompagnement par des professionnels"
    },
    {
      icon: <FaClock size={40} color="#6a1b9a" />,
      title: "Flexibilité Totale",
      description: "Apprentissage à votre rythme"
    },
    {
      icon: <FaFreeCodeCamp size={40} color="#6a1b9a" />,
      title: "Cours Gratuits",
      description: "Sélection de formations sans frais",
      
    },
    {
      icon: <FaCompass size={40} color="#6a1b9a" />,
      title: "Nouveaux Domaines",
      description: "Explorez les technologies émergentes",
      
    }
  ];

  return (
    <section className="about-section">
      <div className="about-container">
        <h2 className="section-title">Savoir. Faire. Savoir-faire.</h2>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {feature.button && (
                <button className="feature-button">{feature.button}</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;