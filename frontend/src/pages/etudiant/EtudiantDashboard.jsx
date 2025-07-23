import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './EtudiantDashboard.css';
import { FiSearch, FiClock, FiBarChart2, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';

function EtudiantDashboard() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data.data);
        setFilteredCourses(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des cours');
        setLoading(false);
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const results = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(results);
  }, [searchTerm, courses]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Ajustez selon votre gestion d'authentification
    navigate('/login');
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="etudiant-container">
      <header className="app-bar">
        <h1>EduPlatform</h1>
        
        <Menu
          menuButton={<MenuButton className="profile-icon"><FiUser size={24} /></MenuButton>}
          align="end"
          arrow
        >
          <MenuItem>
            <Link to="/profile" className="menu-item">Profil</Link>
          </MenuItem>
          <MenuItem>
            <Link to="/settings" className="menu-item">Compte et paramètres</Link>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <span className="menu-item">Déconnexion</span>
          </MenuItem>
        </Menu>
      </header>

      <div className="search-container">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un cours par titre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <section className="recommended-courses">
        <h2>Cours recommandés</h2>
        <div className="course-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course._id} className="course-card">
                <Link to={`/cours/${course._id}`} className="no-underline-link">
                  <div className="course-image">
                    <img src={course.imageUrl || '/default-course.jpg'} alt={course.title} />
                  </div>
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.description || 'Aucune description'}</p>
                    <p className="course-trainer">Formateur : {course.createdBy?.prenom 
                      ? `${course.createdBy.prenom} ${course.createdBy.nom}`
                      : 'Non spécifié'}</p>
                
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="no-results">Aucun cours trouvé pour "{searchTerm}"</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default EtudiantDashboard;