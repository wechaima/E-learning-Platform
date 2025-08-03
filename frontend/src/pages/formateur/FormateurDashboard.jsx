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
          email: updatedUser.email
        });

        toast.success('Profil mis à jour avec succès!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
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

  const handleEditCourse = async (courseData) => {
    try {
      const response = await api.put(`/courses/${selectedCourse._id}`, courseData, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.data.success) {
        toast.success('Cours mis à jour avec succès!');
        const courseResponse = await api.get(`/courses/${selectedCourse._id}?populate=createdBy,chapters.sections,chapters.quiz.questions`);
        const updatedCourse = courseResponse.data.data;

        setAllCourses(prev =>
          prev.map(course => course._id === updatedCourse._id ? updatedCourse : course)
        );
        setMyCourses(prev =>
          prev.map(course => course._id === updatedCourse._id ? updatedCourse : course)
        );
        setShowEditCourseModal(false);
        setShowCourseDetailModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification du cours');
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

  const handleViewCourseDetails = async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}?populate=createdBy,chapters.sections,chapters.quiz.questions`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setSelectedCourse(response.data.data);
      setShowCourseDetailModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du chargement des détails du cours');
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
                <p><strong>Description:</strong> {selectedCourse.description}</p>
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
        >
          <div className="course-modal-content">
            <div className="course-modal-header">
              <h3>Modifier le cours</h3>
              <button 
                onClick={() => setShowEditCourseModal(false)}
                className="close-button"
              >
                &times;
              </button>
            </div>
            <CourseForm 
              onSubmit={handleEditCourse} 
              onCancel={() => setShowEditCourseModal(false)}
              initialData={selectedCourse}
            />
          </div>
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