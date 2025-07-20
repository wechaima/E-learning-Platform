import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import CourseGrid from '../components/CourseGrid/CourseGrid';
import Footer from '../components/Footer/Footer';
import './HomePage.css';

const HomePage = ({ user, onLogout }) => {
  return (
    <div className="home-page">
      <Header user={user} onLogout={onLogout} />
      
      <main>
        <HeroSection />
        <CourseGrid />
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;