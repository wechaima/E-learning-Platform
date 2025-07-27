import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FormateurDashboard.css';

const FormateurDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses', {
        params: { instructor: 'currentUserId' } // Replace with actual user ID from auth
      });
      setCourses(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des cours:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value) {
      axios.get('/courses', {
        params: { search: e.target.value, instructor: 'currentUserId' }
      }).then(response => setCourses(response.data.data));
    } else {
      fetchCourses();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="dashboard-container">
      {/* AppBar */}
      <header className="appbar">
        <div className="appbar-content">
          <h1 className="appbar-title">Tableau de bord Formateur</h1>
          <div className="appbar-actions">
            <input
              type="text"
              placeholder="Rechercher des cours..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <div className="user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-icon-button"
              >
                <svg className="user-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="user-menu">
                  <button onClick={handleProfile} className="menu-item">
                    Profil
                  </button>
                  <button onClick={handleLogout} className="menu-item">
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Course List */}
      <main className="courses-container">
        <h2 className="section-title">Mes Cours</h2>
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-info">
                Abonnés: {course.followers?.length || 0}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FormateurDashboard;