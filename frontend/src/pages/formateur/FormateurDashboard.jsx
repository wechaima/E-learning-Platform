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
  FiEdit,
  FiTrash2,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiBarChart2
} from 'react-icons/fi';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import CourseEditor from '../../components/course/CourseEditor';

import logo from '../../assets/logo2.png';
Modal.setAppElement('#root');

function FormateurDashboard() {
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
  const [showCourseDetailModal, setShowCourseDetailModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

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
          user ? api.get(`/courses/created-by/${user.id}`) : Promise.resolve({ data: [] }),
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
    
    if (user) {
      fetchCourses();
    }
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
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    try {
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
        if (err.response.status === 400) {
          errorMessage = err.response.data.message || 'Données invalides';
        } else if (err.response.status === 401) {
          errorMessage = 'Ancien mot de passe incorrect';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
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

  const handleCreateCourse = async (courseData) => {
    try {
      courseData.createdBy = user.id;
      const response = await api.post('/courses', courseData, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.data.success) {
        toast.success('Cours créé avec succès!');
        const courseResponse = await api.get(`/courses/${response.data.data._id}?populate=createdBy`);
        const newCourse = courseResponse.data.data;
        
        setAllCourses(prev => [newCourse, ...prev]);
        setMyCourses(prev => [newCourse, ...prev]);
        setShowAddCourseModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du cours');
    }
  };

const handleEditCourse = async (updatedCourseData) => {
  try {
    // Préparation des données pour l'API
    const dataToSend = {
      title: updatedCourseData.title,
      description: updatedCourseData.description,
      imageUrl: updatedCourseData.imageUrl,
      category: updatedCourseData.category,
      chapters: updatedCourseData.chapters.map(chapter => ({
        title: chapter.title,
        order: chapter.order,
        sections: chapter.sections.map(section => ({
          title: section.title,
          content: section.content,
          videoUrl: section.videoUrl,
          order: section.order,
          duration: section.duration
        })),
        quiz: {
          passingScore: chapter.quiz.passingScore,
          questions: chapter.quiz.questions.map(question => ({
            text: question.text,
            options: question.options,
            correctOption: question.correctOption,
            explanation: question.explanation,
            points: question.points
          }))
        }
      }))
    };

    const response = await api.put(`/courses/${selectedCourse._id}`, dataToSend, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    if (response.data.success) {
      toast.success('Cours mis à jour avec succès!');
      // Recharger les données mises à jour
      const courseResponse = await api.get(
        `/courses/${selectedCourse._id}?populate=createdBy,chapters,chapters.sections,chapters.quiz,chapters.quiz.questions`
      );
      
      setAllCourses(prev => prev.map(c => c._id === selectedCourse._id ? courseResponse.data.data : c));
      setMyCourses(prev => prev.map(c => c._id === selectedCourse._id ? courseResponse.data.data : c));
      setShowEditCourseModal(false);
    }
  } catch (err) {
    console.error('Erreur complète:', err.response?.data || err);
    toast.error(err.response?.data?.message || 'Échec de la mise à jour du cours');
  }
};

  const handleDeleteCourse = async () => {
    try {
      const response = await api.delete(`/courses/${courseToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.data.success) {
        toast.success('Cours supprimé avec succès!');
        setAllCourses(prev => prev.filter(course => course._id !== courseToDelete._id));
        setMyCourses(prev => prev.filter(course => course._id !== courseToDelete._id));
        setShowDeleteConfirmationModal(false);
        setShowCourseDetailModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression du cours');
    }
  };
// Updated handleViewCourseDetails function
const handleViewCourseDetails = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}?populate=createdBy,chapters,chapters.sections,chapters.quiz,chapters.quiz.questions`);
    
    if (!response.data.data) {
      throw new Error("Structure de données incorrecte");
    }

    const courseData = response.data.data;
    
    const formattedCourse = {
      ...courseData,
      description: courseData.description || '', // Explicitly include description
      category: courseData.category || '',
      chapters: (courseData.chapters || []).map((chapter, chapterIndex) => ({
        ...chapter,
        sections: (chapter.sections || []).map((section) => ({
          ...section,
          content: section.content || '', // Explicitly include content
          videoUrl: section.videoUrl || '',
          duration: section.duration || 0
        })),
        quiz: chapter.quiz ? {
          ...chapter.quiz,
          questions: (chapter.quiz.questions || []).map(question => ({
            ...question,
            options: question.options.map(o => o.text),
            correctOption: question.options.reduce((acc, opt, idx) => {
              if (opt.isCorrect) acc.push(idx);
              return acc;
            }, []),
            multipleAnswers: question.options.filter(opt => opt.isCorrect).length > 1,
            explanation: question.explanation || '',
            points: question.points || 1
          }))
        }: {
          passingScore: 70,
          questions: []
        }
      }))
    };

    console.log('Cours formaté avec options:', formattedCourse);
    setSelectedCourse(formattedCourse);
    setShowCourseDetailModal(true);
  } catch (err) {
    console.error('Erreur:', err);
    toast.error('Erreur lors du chargement des détails du cours');
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
      <ToastContainer />
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
              <h3>Profil Formateur</h3>
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
                <div className="form-group">
                  <label>Rôle</label>
                  <input
                    type="text"
                    value="Formateur"
                    disabled
                    className="disabled-input"
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
                    <h4>Cours créés</h4>
                    <p>{myCourses.length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FiUser className="stat-icon" />
                  <div className="stat-info">
                    <h4>Étudiants inscrits</h4>
                    <p>
                      {myCourses.reduce((acc, course) => acc + (course.followerCount || 0), 0)}
                    </p>
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
                      {showPassword.current ? <FiEye /> : <FiEyeOff />}
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
                      {showPassword.new ? <FiEye /> : <FiEyeOff />}
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
                      {showPassword.confirm ? <FiEye /> : <FiEyeOff />}
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
          isOpen={showAddCourseModal}
          onRequestClose={() => setShowAddCourseModal(false)}
          className="course-modal"
          overlayClassName="course-overlay"
          style={{
            content: {
              width: '90%',
              height: '90%',
              margin: 'auto',
              padding: '0'
            }
          }}
        >
          <CourseEditor 
            onSubmit={handleCreateCourse} 
            onCancel={() => setShowAddCourseModal(false)}
          />
        </Modal>

        <Modal
          isOpen={showCourseDetailModal}
          onRequestClose={() => setShowCourseDetailModal(false)}
          className="course-modal"
          overlayClassName="course-overlay"
        >
          <div className="course-modal-content">
            <div className="course-modal-header">
              <h3>{selectedCourse?.title}</h3>
              <button 
                onClick={() => setShowCourseDetailModal(false)}
                className="close-button"
              >
                &times;
              </button>
            </div>
            {selectedCourse && (
              <div className="course-details">
                <strong>Description:</strong> {selectedCourse.description}
                <h4>Chapitres</h4>
                {selectedCourse.chapters?.length > 0 ? (
                  <ul>
                    {selectedCourse.chapters.map((chapter, index) => (
                      <li key={chapter._id || index}>
                        <strong>Chapitre {index + 1}: {chapter.title}</strong>
                        {chapter.sections?.length > 0 && (
                          <ul>
                            {chapter.sections.map((section, secIndex) => (
                              <li key={section._id || secIndex}>
                                Section {secIndex + 1}: {section.title}
                              </li>
                            ))}
                          </ul>
                        )}
                        {chapter.quiz && (
                          <div className="quiz-info">
                            <p>Quiz: {chapter.quiz.questions?.length || 0} questions</p>
                            <p>Score de passage: {chapter.quiz.passingScore || 70}%</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun chapitre disponible.</p>
                )}
                {selectedCourse.createdBy?._id === user?.id && (
                  <div className="course-actions">
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setShowEditCourseModal(true);
                        setShowCourseDetailModal(false);
                      }}
                    >
                      <FiEdit style={{ marginRight: '5px' }} />
                      Modifier
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => {
                        setCourseToDelete(selectedCourse);
                        setShowDeleteConfirmationModal(true);
                        setShowCourseDetailModal(false);
                      }}
                    >
                      <FiTrash2 style={{ marginRight: '5px' }} />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>

      <Modal
  isOpen={showEditCourseModal}
  onRequestClose={() => setShowEditCourseModal(false)}
  className="course-modal"
  overlayClassName="course-overlay"
  style={{
    content: {
      width: '90%',
      height: '90%',
      margin: 'auto',
      padding: '0'
    }
  }}
>
  <CourseEditor 
    onSubmit={handleEditCourse} 
    onCancel={() => {
      setShowEditCourseModal(false);
      setShowCourseDetailModal(true);
    }}
    initialData={selectedCourse}
  />
</Modal>

        <Modal
          isOpen={showDeleteConfirmationModal}
          onRequestClose={() => setShowDeleteConfirmationModal(false)}
          className="confirmation-modal"
          overlayClassName="confirmation-overlay"
        >
          <ConfirmationModal
            message="Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible."
            onConfirm={handleDeleteCourse}
            onCancel={() => setShowDeleteConfirmationModal(false)}
          />
        </Modal>

        <div className="course-grid">
          {loading ? (
            <div className="loading">Chargement en cours...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course._id}
                className="course-card"
                onClick={() => handleViewCourseDetails(course._id)}
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