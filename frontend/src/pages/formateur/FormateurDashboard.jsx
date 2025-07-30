import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './FormateurDashboard.css';
import { 
  FiSearch, 
  FiUser, 
  FiHome, 
  FiBook, 
  FiPlus,
  FiBarChart2,
  FiEdit,
  FiMail,
  FiAward,
  FiCheckCircle
} from 'react-icons/fi';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import CourseForm from '../../components/course/CourseForm';

Modal.setAppElement('#root');

function FormateurDashboard() {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nom: '',
    prenom: '',
    email: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser({ ...parsedUser, token });
      setProfileForm({
        nom: parsedUser.nom || '',
        prenom: parsedUser.prenom || '',
        email: parsedUser.email || ''
      });
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError('');
        const [allRes, myRes] = await Promise.all([
          api.get('/courses?populate=createdBy'),
          user ? api.get(`/users/${user.id}/created-courses`) : Promise.resolve({ data: [] }),
        ]);
        setAllCourses(allRes.data.data || allRes.data || []);
        setMyCourses(myRes.data.data || myRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des cours');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileForm.nom || !profileForm.prenom || !profileForm.email) {
      return setError('Les champs nom, prénom et email sont obligatoires');
    }

    setPendingUpdate(profileForm);
    setShowConfirmationModal(true);
  };

  const confirmProfileUpdate = async () => {
    setShowConfirmationModal(false);
    
    try {
      const response = await api.put(
        '/user/profile',
        pendingUpdate,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      if (response.data.success) {
        const { password, ...updatedUser } = response.data.data;
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setEditMode(false);
        
        setProfileForm({
          nom: updatedUser.nom,
          prenom: updatedUser.prenom,
          email: updatedUser.email,
          currentPassword: '',
          newPassword: ''
        });

        toast.success('Profil mis à jour avec succès!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        
        setError(null);
      }
    } catch (err) {
      console.error('Erreur détaillée:', err);
      
      let errorMessage = "Échec de la mise à jour. Veuillez réessayer.";
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Mot de passe actuel incorrect";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.message || "Données invalides";
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: ''
      }));
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      const response = await api.post('/courses', courseData, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.data.success) {
        toast.success('Cours créé avec succès!');
        setMyCourses([...myCourses, response.data.data]);
        setShowAddCourseModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du cours');
      console.error('Erreur création cours:', err);
    }
  };

  const filteredCourses = activeTab === 'all'
    ? allCourses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : myCourses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="dashboard-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
            className={`sidebar-link ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            <FiBook className="sidebar-icon" />
            <span>Mes cours</span>
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
          <div className="user-info">
            {user && (
              <div className="user-stats">
                <span className="user-name">
                  {user.prenom} {user.nom}
                </span>
                <span className="user-role">Formateur</span>
              </div>
            )}
            <Menu
              menuButton={
                <MenuButton className="profile-button">
                  <div className="user-stats-badge">
                    <FiUser size={20} />
                  </div>
                </MenuButton>
              }
              align="end"
              arrow
            >
              <MenuItem onClick={() => setShowProfileModal(true)}>
                <div className="menu-item">
                  <FiUser style={{ marginRight: '8px' }} />
                  Profil
                </div>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <span className="menu-item">Déconnexion</span>
              </MenuItem>
            </Menu>
          </div>
        </header>

        <div className="actions-bar">
          <button 
            className="add-course-button"
            onClick={() => setShowAddCourseModal(true)}
          >
            <FiPlus className="button-icon" />
            Ajouter un cours
          </button>
        </div>

        {showConfirmationModal && (
          <ConfirmationModal
            message="Êtes-vous sûr de vouloir modifier votre profil ?"
            onConfirm={confirmProfileUpdate}
            onCancel={() => setShowConfirmationModal(false)}
          /> 
        )}

        <Modal
          isOpen={showProfileModal}
          onRequestClose={() => {
            setShowProfileModal(false);
            setEditMode(false);
          }}
          className="profile-modal"
          overlayClassName="profile-overlay"
        >
          <div className="profile-modal-content">
            <div className="profile-modal-header">
              <h3>Profil Formateur</h3>
              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  setEditMode(false);
                }}
                className="close-button"
              >
                &times;
              </button>
            </div>
            
            {editMode ? (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    value={profileForm.prenom}
                    onChange={(e) => setProfileForm({...profileForm, prenom: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={profileForm.nom}
                    onChange={(e) => setProfileForm({...profileForm, nom: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setEditMode(false)} className="cancel-btn">
                    Annuler
                  </button>
                  <button type="submit" className="save-btn">
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <FiUser className="info-icon" />
                  <span>{user?.prenom} {user?.nom}</span>
                </div>
                <div className="info-item">
                  <FiMail className="info-icon" />
                  <span>{user?.email}</span>
                </div>
                <div className="progress-summary">
                  <h4>Statistiques</h4>
                  <div className="progress-item">
                    <span>Cours créés:</span>
                    <span>{myCourses.length}</span>
                  </div>
                  <div className="progress-item">
                    <span>Étudiants inscrits:</span>
                    <span>
                      {myCourses.reduce((acc, course) => acc + (course.followerCount || 0), 0)}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setEditMode(true)} 
                  className="edit-btn"
                >
                  <FiEdit style={{ marginRight: '5px' }} />
                  Modifier le profil
                </button>
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={showAddCourseModal}
          onRequestClose={() => setShowAddCourseModal(false)}
          className="course-modal"
          overlayClassName="course-overlay"
        >
          <div className="course-modal-content">
            <div className="course-modal-header">
              <h3>Créer un nouveau cours</h3>
              <button 
                onClick={() => setShowAddCourseModal(false)}
                className="close-button"
              >
                &times;
              </button>
            </div>
            <CourseForm 
              onSubmit={handleCreateCourse} 
              onCancel={() => setShowAddCourseModal(false)}
            />
          </div>
        </Modal>

        <div className="course-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course._id}
                className="course-card"
                onClick={() => navigate(`/formateur/cours/${course._id}`)}
              >
                <div className="course-image-container">
                  <img
                    src={course.imageUrl || '/default-course.jpg'}
                    alt={course.title}
                    className="course-image"
                  />
                  <div className="course-badge">
                    <span className="follower-count">
                      <FiUser /> {course.followerCount || 0} étudiants
                    </span>
                  </div>
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="course-description">
                    {course.description?.substring(0, 100)}
                    {course.description?.length > 100 ? '...' : ''}
                  </p>
                  {activeTab === 'all' && (
                    <div className="course-instructor">
                      <span>Créé par: {course.createdBy?.prenom} {course.createdBy?.nom}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              {activeTab === 'my'
                ? 'Vous n\'avez créé aucun cours pour le moment'
                : `Aucun cours trouvé pour "${searchTerm}"`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormateurDashboard;