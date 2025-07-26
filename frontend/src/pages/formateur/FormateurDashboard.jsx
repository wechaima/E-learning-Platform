import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { FiUser } from 'react-icons/fi';
import { PlusIcon } from '@heroicons/react/outline';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import './FormateurDashboard.css';
import CourseList from '../../components/formateurs/CourseList/CourseListe';
import AddCourseModal from '../../components/formateurs/AddCourseModal/AddCourseModal';
import LoadingSpinner from '../../components/formateurs/ui/LoadingSpinner';
import ErrorMessage from '../../components/formateurs/ui/ErreurMessage';


const DashboardFormateur = ({ onLogout }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const navigate = useNavigate();

  const defaultAvatar = '/default-avatar.png';

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchFormateurCourses = async () => {
      try {
        if (!user?.id) {
          throw new Error('Authentification requise');
        }

        setLoading(true);
        setError(null);

        const response = await axios.get('/courses', {
          params: { instructor: user.id },
          signal: controller.signal
        });

        if (isMounted) {
          setCourses(response.data.data || []);
        }
      } catch (err) {
        if (isMounted) {
          if (err.name !== 'CanceledError') {
            console.error('Erreur:', err);
            setError(err.response?.data?.message || 
                    err.message || 
                    'Erreur lors du chargement des cours');
            
            if (err.response?.status === 401) {
              navigate('/login', { replace: true });
            }
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFormateurCourses();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user, navigate]);

  const handleAddCourse = async (newCourse) => {
    try {
      setError(null);
      const response = await axios.post('/courses', {
        ...newCourse,
        createdBy: user.id
      });
      
      setCourses(prev => [...prev, response.data.data]);
      setShowAddCourseModal(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 
              'Erreur lors de la création du cours');
    }
  };

  const handleUpdateCourse = async (courseId, updatedData) => {
    try {
      setError(null);
      const response = await axios.put(`/courses/${courseId}`, updatedData);
      setCourses(prev => 
        prev.map(c => c._id === courseId ? response.data.data : c)
      );
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 
              'Erreur lors de la mise à jour du cours');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      setError(null);
      await axios.delete(`/courses/${courseId}`);
      setCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 
              'Erreur lors de la suppression du cours');
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/formateur/cours/${courseId}`);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Le useEffect se déclenchera automatiquement
  };

  return (
    <div className="dashboard-formateur">
      {/* AppBar */}
      <header className="formateur-appbar">
        <div className="appbar-content">
          <h1>Tableau de bord Formateur</h1>
          
          <Menu
            menuButton={
              <MenuButton className="profile-button">
                <div className="profile-content">
                  <img 
                    src={user?.avatar || defaultAvatar} 
                    alt="Profil" 
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                  <span>{user?.prenom || 'Formateur'}</span>
                  <FiUser className="user-icon" />
                </div>
              </MenuButton>
            }
            align="end"
            arrow
            transition
            menuClassName="profile-menu"
          >
            <MenuItem className="menu-item">
              <Link to="/formateur/profil" className="menu-link">
                Profil
              </Link>
            </MenuItem>
            <MenuItem className="menu-item">
              <Link to="/formateur/parametres" className="menu-link">
                Paramètres
              </Link>
            </MenuItem>
            <MenuItem className="menu-item" onClick={onLogout}>
              <span className="menu-link">Déconnexion</span>
            </MenuItem>
          </Menu>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="formateur-content">
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={handleRetry} 
            className="dashboard-error" 
          />
        )}

        <div className="courses-header">
          <h2>Mes Cours {!loading && `(${courses.length})`}</h2>
          <button 
            className="add-course-button"
            onClick={() => setShowAddCourseModal(true)}
            disabled={loading}
          >
            <PlusIcon className="plus-icon" />
            Ajouter un cours
          </button>
        </div>

        {loading ? (
          <LoadingSpinner fullScreen={false} text="Chargement des cours..." />
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>Vous n'avez pas encore créé de cours</p>
            <button 
              className="primary-button"
              onClick={() => setShowAddCourseModal(true)}
            >
              Créer mon premier cours
            </button>
          </div>
        ) : (
          <CourseList 
            courses={courses} 
            onCourseClick={handleCourseClick}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            isFormateur={true}
          />
        )}
      </main>

      {/* Modal d'ajout de cours */}
      <AddCourseModal
        isOpen={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        onSubmit={handleAddCourse}
      />

      <Outlet />
    </div>
  );
};

export default DashboardFormateur;