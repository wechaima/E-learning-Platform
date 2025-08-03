import Header from '../components/Header/Header';
import PlatformDefinition from '../components/PlatformDefinition/PlatformDefinition';
import AboutSection from '../components/AboutSection/AboutSection';
import CourseGrid from '../components/CourseGrid/CourseGrid';
import CtaBanner from '../components/CtaBanner/CtaBanner';
import Footer from '../components/Footer/Footer';
import './HomePage.css';

const HomePage = ({ user, onLogout }) => {
  return (
    <div className="home-page">
      <Header user={user} onLogout={onLogout} />
      
      <main>
        {/* Section 1: Définition de la plateforme */}
        <PlatformDefinition />
        
        {/* Section 2: Grille de cours avec fond coloré */}
        <section className="colored-section">
          <CourseGrid />
        </section>
        
        {/* Section 3: À propos avec images */}
        <AboutSection />
        
        {/* Section 4: Bannière CTA */}
        <CtaBanner />
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;