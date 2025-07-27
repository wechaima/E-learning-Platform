import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './EtudiantDashboard.css';
import { 
  FiSearch, 
  FiUser, 
  FiUsers, 
  FiHome, 
  FiBook, 
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


Modal.setAppElement('#root');

function EtudiantDashboard() {
  // Ajoutez ces états au début de votre composant
 const [showConfirmationModal, setShowConfirmationModal] = useState(false);
const [pendingUpdate, setPendingUpdate] = useState(null);

  const [allCourses, setAllCourses] = useState([]);
  const [followedCourses, setFollowedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
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

  const fetchProgressData = async () => {
    try {
      const response = await api.get('/progress', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur inconnue');
      }

      setProgressData(response.data.data || []);
      setShowProgressModal(true);
      
    } catch (err) {
      console.error('Erreur:', {
        message: err.message,
        response: err.response?.data,
        stack: err.stack
      });
      setError("Erreur lors du chargement des données de progression");
    }
  };

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

const handleProfileUpdate = async (e) => {
  e.preventDefault();
  
  // Vérification des champs requis
  if (!profileForm.nom || !profileForm.prenom || !profileForm.email) {
    return setError('Les champs nom, prénom et email sont obligatoires');
  }

  // Afficher la modal de confirmation
  setPendingUpdate(profileForm);
  setShowConfirmationModal(true);
};

// Ajoutez cette fonction pour gérer la confirmation
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

      // Afficher le toast de succès
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

    // Afficher le toast d'erreur
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

  const filteredCourses = activeTab === 'all'
    ? allCourses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : followedCourses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="dashboard-container">
       {/* Ajoutez le ToastContainer près de la racine */}
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
          <div className="user-info">
            {user && (
              <span className="user-name">
                {user.prenom} {user.nom}
              </span>
            )}
            <Menu
              menuButton={
                <MenuButton className="profile-button">
                  <FiUser size={20} />
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
              <MenuItem onClick={fetchProgressData}>
                <div className="menu-item">
                  <FiBarChart2 style={{ marginRight: '8px' }} />
                  Parcours
                </div>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <span className="menu-item">Déconnexion</span>
              </MenuItem>
            </Menu>
          </div>
        </header>
 {/* Ajoutez la modal de confirmation */}
    {showConfirmationModal && (
      <ConfirmationModal
        message="Êtes-vous sûr de vouloir modifier votre profil ?"
        onConfirm={confirmProfileUpdate}
        onCancel={() => setShowConfirmationModal(false)}
      /> )}
        {/* Modal de profil */}
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
              <h3>Profil Utilisateur</h3>
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

        {/* Modal de progression */}
        <Modal
          isOpen={showProgressModal}
          onRequestClose={() => setShowProgressModal(false)}
          className="progress-modal"
          overlayClassName="progress-overlay"
        >
          <div className="progress-modal-content">
            <div className="progress-modal-header">
              <h3>Votre progression</h3>
              <button 
                onClick={() => setShowProgressModal(false)}
                className="close-button"
              >
                &times;
              </button>
            </div>
            
            <div className="progress-list">
              {progressData.length > 0 ? (
                progressData.map((course) => (
                  <div key={course.courseId} className="course-progress">
                    <div className="course-header">
                      <h4>{course.courseTitle}</h4>
                      <div className="overall-progress">
                        <span>Progression globale: </span>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${course.overallProgress}%` }}
                          >
                            {course.overallProgress}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="chapters-progress">
                      {course.chapterProgress
                        .filter(chapter => chapter.quizCompleted || chapter.completedSections > 0)
                        .map(chapter => (
                          <div key={chapter.chapterId} className="chapter-progress">
                            <div className="chapter-header">
                              <h5>{chapter.chapterTitle}</h5>
                              {chapter.quizCompleted && (
                                <div className="quiz-badge">
                                  <FiAward className="badge-icon" />
                                  <span>Quiz complété</span>
                                </div>
                              )}
                            </div>
                            {chapter.completedSections > 0 && (
                              <div className="section-progress">
                                <FiCheckCircle className="progress-icon" />
                                <span>Sections complétées: {chapter.completedSections}</span>
                              </div>
                            )}
                            {chapter.quizCompleted && (
                              <div className="quiz-progress">
                                <span>Score du quiz: </span>
                                <span className="quiz-score">{chapter.quizScore}%</span>
                              </div>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-progress">
                  <p>Aucune progression enregistrée</p>
                  <p>Commencez à suivre des cours et complétez des sections pour voir votre progression.</p>
                </div>
              )}
            </div>
          </div>
        </Modal>

        <div className="course-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course._id}
                className="course-card"
                onClick={() => navigate(`/cours/${course._id}`)}
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