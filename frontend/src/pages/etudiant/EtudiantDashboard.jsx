import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './EtudiantDashboard.css';
import { FiSearch, FiUser, FiUsers, FiHome, FiBook } from 'react-icons/fi';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

function EtudiantDashboard() {
  const [allCourses, setAllCourses] = useState([]);
  const [followedCourses, setFollowedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser({ ...parsedUser, token });
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError('');
        const [allRes, followedRes] = await Promise.all([
          api.get('/courses?populate=createdBy'),
          user ? api.get(`/users/${user.id}/followed-courses`) : Promise.resolve({ data: [] }),
        ]);
        setAllCourses(allRes.data.data || allRes.data || []);
        setFollowedCourses(followedRes.data.data || followedRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des cours');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const handleFollowCourse = async (courseId, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post(
        `/courses/${courseId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const updatedAllCourses = allCourses.map((course) =>
        course._id === courseId
          ? {
              ...course,
              followers: [...(course.followers || []), user.id],
              followerCount: (course.followerCount || 0) + 1,
            }
          : course
      );
      setAllCourses(updatedAllCourses);
      setFollowedCourses([...followedCourses, updatedAllCourses.find((c) => c._id === courseId)]);
    } catch (err) {
      console.error("Erreur lors de l'abonnement:", err);
      setError("Erreur lors de l'abonnement au cours");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const filteredCourses =
    activeTab === 'all'
      ? allCourses.filter((course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : followedCourses.filter((course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>EduPlatform</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <FiHome className="sidebar-icon" />
            <span>Tous les cours</span>
          </button>
          <button
            className={`sidebar-link ${activeTab === 'followed' ? 'active' : ''}`}
            onClick={() => setActiveTab('followed')}
          >
            <FiBook className="sidebar-icon" />
            <span>Mes cours suivis</span>
          </button>
        </nav>
      </div>
      <div className="main-content">
        <header className="app-bar">
          <div className="search-container">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Menu
            menuButton={
              <MenuButton className="profile-button">
                <FiUser size={20} />
              </MenuButton>
            }
            align="end"
            arrow
          >
            <MenuItem>
              <Link to="/profile" className="menu-item">Profil</Link>
            </MenuItem>
            <MenuItem>
              <Link to="/settings" className="menu-item">Paramètres</Link>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <span className="menu-item">Déconnexion</span>
            </MenuItem>
          </Menu>
        </header>
        <div className="course-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course._id}
                className="course-card"
                onClick={() => {
                  console.log('Navigating to course:', course._id);
                  navigate(`/cours/${course._id}`);
                }}
              >
                <div className="course-image-container">
                  <img
                    src={course.imageUrl || '/default-course.jpg'}
                    alt={course.title}
                    className="course-image"
                  />
                  <div className="course-badge">
                    <span className="follower-count">
                      <FiUsers /> {course.followerCount || 0}
                    </span>
                    {activeTab === 'all' && !course.followers?.includes(user?.id) && (
                      <button
                        className="follow-button"
                        onClick={(e) => handleFollowCourse(course._id, e)}
                      >
                        S'abonner
                      </button>
                    )}
                  </div>
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="course-description">
                    {course.description?.substring(0, 100)}
                    {course.description?.length > 100 ? '...' : ''}
                  </p>
                  <div className="course-instructor">
                    <FiUser size={14} />
                    <span>
                      {course.createdBy?.prenom} {course.createdBy?.nom}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              {activeTab === 'followed'
                ? 'Vous ne suivez aucun cours pour le moment'
                : `Aucun cours trouvé pour "${searchTerm}"`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EtudiantDashboard;