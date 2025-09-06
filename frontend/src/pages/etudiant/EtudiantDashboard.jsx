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
  FiCheckCircle,
  FiLock,
  FiEye,
  FiEyeOff,
  FiList
} from 'react-icons/fi';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import logo from '../../assets/logo2.png';
Modal.setAppElement('#root');

function EtudiantDashboard() {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [followedCourses, setFollowedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [progressStats, setProgressStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    averageScore: null,
    completionPercentage: 0
  });
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState('info');
  const [profileForm, setProfileForm] = useState({
    nom: '',
    prenom: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
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
        const courses = allRes.data.data || allRes.data || [];
        setAllCourses(courses);
        setFollowedCourses(followedRes.data.data || followedRes.data || []);
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(courses.map(course => course.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des cours');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (user) {
      const loadProgressStats = async () => {
        try {
          const response = await api.get('/progress', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (response.data.success) {
            setProgressStats(response.data.data?.stats || {
              totalCourses: 0,
              completedCourses: 0,
              averageScore: null,
              completionPercentage: 0
            });
          }
        } catch (err) {
          console.error("Erreur de chargement des stats:", err);
        }
      };
      loadProgressStats();
    }
  }, [user]);

  const fetchProgressData = async () => {
    try {
      const response = await api.get('/progress', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur inconnue');
      }

      setProgressData(response.data.data?.courses || []);
      setProgressStats(response.data.data?.stats || {
        totalCourses: 0,
        completedCourses: 0,
        averageScore: null,
        completionPercentage: 0
      });
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
    
    if (!profileForm.nom || !profileForm.prenom || !profileForm.email) {
      return toast.error('Les champs nom, prénom et email sont obligatoires');
    }

    try {
      const response = await api.put(
        '/user/profile',
        profileForm,
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
        
        toast.success('Profil mis à jour avec succès!');
      }
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    try {
      // Validation côté client
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        return toast.error('Tous les champs sont obligatoires');
      }

      if (passwordForm.newPassword.length < 8) {
        return toast.error('Le mot de passe doit contenir au moins 8 caractères');
      }

      if (!/[A-Z]/.test(passwordForm.newPassword) || !/[!@#$%^&*]/.test(passwordForm.newPassword)) {
        return toast.error('Le mot de passe doit contenir une majuscule et un caractère spécial');
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        return toast.error('Les mots de passe ne correspondent pas');
      }

      const response = await api.put(
        '/user/change-password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Mot de passe mis à jour avec succès!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('Détails de l\'erreur:', {
        message: err.message,
        response: err.response?.data,
        config: err.config
      });

      let errorMessage = 'Erreur serveur - Veuillez réessayer plus tard';
      
      if (err.response) {
        // Erreur avec réponse du serveur
        if (err.response.status === 400) {
          errorMessage = err.response.data.message || 'Données invalides';
        } else if (err.response.status === 401) {
          errorMessage = 'Ancien mot de passe incorrect';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // La requête a été faite mais pas de réponse
        errorMessage = 'Pas de réponse du serveur - Vérifiez votre connexion';
      }

      toast.error(errorMessage);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const filteredCourses = activeTab === 'all'
    ? allCourses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'all' || course.category === selectedCategory)
      )
    : followedCourses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'all' || course.category === selectedCategory)
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
          <img src={logo} alt="EduPlatform Logo" className="logo-image" />
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
            <Menu
              menuButton={
                <MenuButton className="category-button">
                  <FiList className="category-icon" />
                  Catégories
                </MenuButton>
              }
              align="start"
              transition
            >
              {categories.map((category, index) => (
                <MenuItem
                  key={index}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'category-item active' : 'category-item'}
                >
                  {category === 'all' ? 'Toutes les catégories' : category}
                </MenuItem>
              ))}
            </Menu>
          </div>
          <div className="user-info">
            {user && (
              <div className="user-stats">
                <span className="user-name">
                  {user.prenom} {user.nom}
                </span>
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
              <MenuItem onClick={fetchProgressData}>
                <div className="menu-item">
                  <FiBarChart2 style={{ marginRight: '8px' }} />
                  Détails de progression
                </div>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <span className="menu-item">Déconnexion</span>
              </MenuItem>
            </Menu>
          </div>
        </header>

        <Modal
          isOpen={showProfileModal}
          onRequestClose={() => {
            setShowProfileModal(false);
            setProfileTab('info');
          }}
          className="profile-modal"
          overlayClassName="profile-overlay"
        >
          <div className="profile-modal-content">
            <div className="profile-modal-header">
              <h3>Mon Profil</h3>
              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileTab('info');
                }}
                className="close-button"
              >
                &times;
              </button>
            </div>
            
            <div className="profile-tabs">
              <button 
                className={`profile-tab ${profileTab === 'info' ? 'active' : ''}`}
                onClick={() => setProfileTab('info')}
              >
                Informations
              </button>
              <button 
                className={`profile-tab ${profileTab === 'stats' ? 'active' : ''}`}
                onClick={() => setProfileTab('stats')}
              >
                Statistiques
              </button>
              <button 
                className={`profile-tab ${profileTab === 'password' ? 'active' : ''}`}
                onClick={() => setProfileTab('password')}
              >
                Mot de passe
              </button>
            </div>
            
            {profileTab === 'info' ? (
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
                  <button type="submit" className="save-btn">
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : profileTab === 'stats' ? (
              <div className="stats-container">
                <div className="stat-card">
                  <FiBook className="stat-icon" />
                  <div className="stat-info">
                    <h4>Cours suivis</h4>
                    <p>{progressStats.totalCourses}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FiAward className="stat-icon" />
                  <div className="stat-info">
                    <h4>Cours terminés</h4>
                    <p>{progressStats.completedCourses}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FiBarChart2 className="stat-icon" />
                  <div className="stat-info">
                    <h4>Moyenne des quiz</h4>
                    <p>{progressStats.averageScore ? `${progressStats.averageScore}%` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="password-form">
                <div className="form-group">
                  <label>
                    <FiLock /> Ancien mot de passe
                  </label>
                  <div className="password-input">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    />
                    <button 
                      type="button" 
                      onClick={() => togglePasswordVisibility('current')}
                      className="toggle-password"
                    >
                      {showPassword.current ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <FiLock /> Nouveau mot de passe
                  </label>
                  <div className="password-input">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    />
                    <button 
                      type="button" 
                      onClick={() => togglePasswordVisibility('new')}
                      className="toggle-password"
                    >
                      {showPassword.new ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <FiLock /> Confirmer le mot de passe
                  </label>
                  <div className="password-input">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    />
                    <button 
                      type="button" 
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="toggle-password"
                    >
                      {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    Modifier le mot de passe
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>

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
                <>
                  <div className="global-stats">
                    <div className="stat-card">
                      <h4>Cours suivis</h4>
                      <p>{progressStats.totalCourses}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Cours terminés</h4>
                      <p>{progressStats.completedCourses}</p>
                    </div>
                    {progressStats.averageScore && (
                      <div className="stat-card">
                        <h4>Moyenne des quiz</h4>
                        <p>{progressStats.averageScore}%</p>
                      </div>
                    )}
                  </div>
                  
                  {progressData.map((course) => (
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
                  ))}
                </>
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
                  <div className="course-category">
                    <span>Catégorie: {course.category}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              {activeTab === 'followed'
                ? 'Vous ne suivez aucun cours pour le moment'
                : `Aucun cours trouvé pour "${searchTerm}"${selectedCategory !== 'all' ? ` dans la catégorie "${selectedCategory}"` : ''}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EtudiantDashboard;