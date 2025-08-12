import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaChalkboardTeacher, FaPlus, FaBars, 
  FaEdit, FaTrash, FaSignOutAlt, FaUserShield, FaBell, FaUserCircle,
  FaChartBar, FaBook, FaChartLine, FaCheckCircle, FaBookOpen,
  FaUserGraduate, FaGraduationCap, FaUserFriends, FaEnvelope, FaSearch
} from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import api from '../../api/axios';
import './AdminDashboard.css';
import AdminFormModal from './AdminFormModal.jsx';
import FormateurFormModal from './FormateurFormModal.jsx';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal.jsx';
import ProfileModal from './ProfileModal.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function AdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showFormateurModal, setShowFormateurModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentFormateur, setCurrentFormateur] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    etudiants: 0,
    formateurs: 0,
    admins: 0,
    cours: 0,
    abonnements: 0
  });
  const navigate = useNavigate();
  const [formateurDetails, setFormateurDetails] = useState(null);
  const [etudiantDetails, setEtudiantDetails] = useState(null);
  const [showFormateurDetails, setShowFormateurDetails] = useState(false);
  const [showEtudiantDetails, setShowEtudiantDetails] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [formDataToSave, setFormDataToSave] = useState(null);
  const [showDeleteFormateurConfirmation, setShowDeleteFormateurConfirmation] = useState(false);
  const [formateurToDelete, setFormateurToDelete] = useState(null);
  const [showSaveFormateurConfirmation, setShowSaveFormateurConfirmation] = useState(false);
  const [formateurDataToSave, setFormateurDataToSave] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFormateurs, setFilteredFormateurs] = useState([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
          setUserProfile(res.data.data);
        }
      } catch (err) {
        toast.error('Erreur lors du chargement du profil');
        console.error(err);
      }
    };

    fetchUserProfile();
    
    if (activeTab === 'dashboard') {
      fetchStats();
    } else {
      fetchData();
    }
  }, [activeTab]);

  // Effet pour filtrer les données
  useEffect(() => {
    if (activeTab === 'formateurs') {
      const filtered = formateurs.filter(formateur => 
        `${formateur.prenom} ${formateur.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (formateur.specialite && formateur.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredFormateurs(filtered);
    } else if (activeTab === 'etudiants') {
      const filtered = etudiants.filter(etudiant => 
        `${etudiant.prenom} ${etudiant.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etudiant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEtudiants(filtered);
    } else if (activeTab === 'admins') {
      const filtered = admins.filter(admin => 
        `${admin.prenom} ${admin.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAdmins(filtered);
    }
  }, [searchTerm, formateurs, etudiants, admins, activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats/dashboard-stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      toast.error('Erreur lors du chargement des statistiques');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'formateurs') {
        const res = await api.get('/formateur');
        const data = res.data.data || res.data || [];
        setFormateurs(data);
        setFilteredFormateurs(data);
      } else if (activeTab === 'etudiants') {
        const res = await api.get('/etudiants');
        const data = res.data.data || res.data || [];
        setEtudiants(data);
        setFilteredEtudiants(data);
      } else if (activeTab === 'admins') {
        const res = await api.get('/auth/admins');
        const data = res.data.data || res.data || [];
        setAdmins(data);
        setFilteredAdmins(data);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormateurDetails = async (formateurId) => {
    try {
      const res = await api.get(`/stats/formateurs/${formateurId}/stats`);
      setFormateurDetails(res.data.data);
      setShowFormateurDetails(true);
    } catch (err) {
      console.error('Erreur complète:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      showError(err.response?.data?.message || 'Erreur de chargement');
    }
  };

  const fetchEtudiantDetails = async (email) => {
    if (!email) {
      showError("Email manquant");
      return;
    }

    try {
      const userRes = await api.get(`/user/by-email/${encodeURIComponent(email)}`);
      
      if (!userRes.data.success || !userRes.data.data?._id) {
        throw new Error(userRes.data.message || 'Utilisateur non trouvé');
      }

      const statsRes = await api.get(`/stats/etudiants/${userRes.data.data._id}/stats`);
      
      if (!statsRes.data.success) {
        throw new Error(statsRes.data.message || 'Statistiques non disponibles');
      }

      setEtudiantDetails({
        ...statsRes.data.data,
        email: email
      });
      setShowEtudiantDetails(true);

    } catch (err) {
      console.error('Erreur complète:', {
        message: err.message,
        response: err.response?.data
      });
      showError(err.message || 'Erreur de chargement');
    }
  };

  const barChartData = {
    labels: ['Étudiants', 'Formateurs', 'Admins', 'Cours', 'Abonnements'],
    datasets: [
      {
        label: 'Nombre',
        data: [stats.etudiants, stats.formateurs, stats.admins, stats.cours, stats.abonnements],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const pieChartData = {
    labels: ['Étudiants', 'Formateurs', 'Admins'],
    datasets: [
      {
        data: [stats.etudiants, stats.formateurs, stats.admins],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Statistiques de la plateforme',
        font: {
          size: 16
        }
      }
    }
  };

  const showError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const showSuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleAddAdmin = async (formData) => {
    try {
      const res = await api.post('/auth/admins', formData);
      setAdmins(prev => [...prev, res.data]);
      setFilteredAdmins(prev => [...prev, res.data]);
      setShowAdminModal(false);
      showSuccess('Admin ajouté avec succès');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  };

  const handleUpdateAdmin = async () => {
    try {
      const res = await api.put(`/auth/admins/${currentAdmin._id}`, formDataToSave);
      setAdmins(prev => 
        prev.map(a => a._id === currentAdmin._id ? res.data : a)
      );
      setFilteredAdmins(prev => 
        prev.map(a => a._id === currentAdmin._id ? res.data : a)
      );
      if (currentAdmin._id === userProfile?.id) {
        setUserProfile(res.data);
      }
      setShowAdminModal(false);
      setCurrentAdmin(null);
      setFormDataToSave(null);
      showSuccess('Admin modifié avec succès');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setShowSaveConfirmation(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    try {
      await api.delete(`/auth/admins/${id}`);
      setAdmins(prev => prev.filter(a => a._id !== id));
      setFilteredAdmins(prev => prev.filter(a => a._id !== id));
      showSuccess('Admin supprimé avec succès');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
    }
  };

  const handleAddFormateur = async (formData) => {
    try {
      const res = await api.post('/auth/formateurs', formData);
      setFormateurs(prev => [...prev, res.data]);
      setFilteredFormateurs(prev => [...prev, res.data]);
      setShowFormateurModal(false);
      showSuccess('Formateur ajouté avec succès');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  };

  const handleUpdateFormateur = async () => {
    try {
      const res = await api.put(`/formateur/${currentFormateur._id}`, formateurDataToSave);
      setFormateurs(prev => 
        prev.map(f => f._id === currentFormateur._id ? res.data : f)
      );
      setFilteredFormateurs(prev => 
        prev.map(f => f._id === currentFormateur._id ? res.data : f)
      );
      setShowFormateurModal(false);
      setCurrentFormateur(null);
      setFormateurDataToSave(null);
      showSuccess('Formateur modifié avec succès');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setShowSaveFormateurConfirmation(false);
    }
  };

  const handleDeleteFormateur = async (id) => {
    try {
      await api.delete(`/formateur/${id}`);
      setFormateurs(prev => prev.filter(f => f._id !== id));
      setFilteredFormateurs(prev => prev.filter(f => f._id !== id));
      showSuccess('Formateur supprimé avec succès');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setShowDeleteFormateurConfirmation(false);
      setFormateurToDelete(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setShowProfileDropdown(false);
    setUserProfile(null);
  };

  const handleEditProfile = () => {
    setShowProfileModal(true);
    setShowProfileDropdown(false);
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      setUserProfile(res.data.data);
      showSuccess('Profil mis à jour avec succès');
      setShowProfileModal(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const handleChangePassword = async (passwordData) => {
    try {
      const res = await api.put('/auth/change-password', passwordData);
      showSuccess(res.data.message);
      setShowProfileModal(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  };

  const handleNotifications = () => {
    alert('Fonctionnalité de notifications à venir!');
    setShowProfileDropdown(false);
  };

  return (
    <div className="admin-container">
      <ToastContainer />
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onClose={() => {}}
        userProfile={userProfile}
      />
      
      <div className="admin-main-content">
        <header className="admin-header">
          <h1 className="admin-title">
            {activeTab === 'dashboard' ? 'Tableau de bord' :
             activeTab === 'formateurs' ? 'Gestion des formateurs' : 
             activeTab === 'etudiants' ? 'Liste des étudiants' : 
             'Gestion des admins'}
          </h1>
          <div className="profile-section">
            <button 
              className="profile-btn"
              onClick={(e) => {
                e.preventDefault();
                setShowProfileDropdown(!showProfileDropdown);
              }}
            >
              <FaUserCircle size={30} />
              {userProfile && <span>{userProfile.prenom} {userProfile.nom}</span>}
            </button>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <button onClick={handleEditProfile} className="dropdown-item">
                  <FaUserCircle /> Mon Profil
                </button>
                <button onClick={handleNotifications} className="dropdown-item">
                  <FaBell /> Notifications
                </button>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <FaSignOutAlt /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="admin-content">
          {activeTab === 'dashboard' ? (
            <div className="dashboard-stats">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
                    <FaUsers />
                  </div>
                  <div className="stat-info">
                    <h3>Étudiants</h3>
                    <p>{stats.etudiants}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
                    <FaChalkboardTeacher />
                  </div>
                  <div className="stat-info">
                    <h3>Formateurs</h3>
                    <p>{stats.formateurs}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#8b5cf6' }}>
                    <FaUserShield />
                  </div>
                  <div className="stat-info">
                    <h3>Admins</h3>
                    <p>{stats.admins}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
                    <FaBook />
                  </div>
                  <div className="stat-info">
                    <h3>Cours</h3>
                    <p>{stats.cours}</p>
                  </div>
                </div>
              </div>

              <div className="charts-container">
                <div className="chart-card">
                  <h3>Statistiques globales</h3>
                  <Bar data={barChartData} options={chartOptions} />
                </div>
                <div className="chart-card">
                  <h3>Répartition des utilisateurs</h3>
                  <Pie data={pieChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card">
              <div className="card-header">
                <h2>
                  {activeTab === 'formateurs' ? `Formateurs (${filteredFormateurs.length})` 
                   : activeTab === 'etudiants' ? `Étudiants (${filteredEtudiants.length})` 
                   : `Admins (${filteredAdmins.length})`}
                </h2>
                
         <div class="search-container">
  
   
    <input
      type="text"
      placeholder="Rechercher par nom..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    /><button className="search-button">
              <FaSearch />
            </button>
  </div>
                {activeTab === 'formateurs' && (
                  <button 
                    onClick={() => {
                      setCurrentFormateur(null);
                      setShowFormateurModal(true);
                    }}
                    className="add-btn"
                  >
                    <FaPlus /> Ajouter
                  </button>
                )}
                {activeTab === 'admins' && (
                  <button 
                    onClick={() => {
                      setCurrentAdmin(null);
                      setShowAdminModal(true);
                    }}
                    className="add-btn"
                  >
                    <FaPlus /> Ajouter
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Chargement en cours...</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {activeTab === 'formateurs' ? (
                          <>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Spécialité</th>
                            <th>Actions</th>
                          </>
                        ) : activeTab === 'etudiants' ? (
                          <>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Date inscription</th>
                          </>
                        ) : (
                          <>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {activeTab === 'formateurs' ? (
                        filteredFormateurs.length > 0 ? (
                          filteredFormateurs.map((formateur) => (
                            <tr key={formateur._id}>
                              <td>{formateur.prenom} {formateur.nom}</td>
                              <td>
                                <button 
                                  onClick={() => fetchFormateurDetails(formateur._id)}
                                  className="email-btn"
                                >
                                  {formateur.email}
                                </button>
                              </td>
                              <td>{formateur.specialite}</td>
                              <td className="actions">
                                <button 
                                  onClick={() => {
                                    setCurrentFormateur(formateur);
                                    setShowFormateurModal(true);
                                  }}
                                  className="edit-btn"
                                >
                                  <FaEdit />
                                </button>
                                <button 
                                  onClick={() => {
                                    setFormateurToDelete(formateur._id);
                                    setShowDeleteFormateurConfirmation(true);
                                  }}
                                  className="delete-btn"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="no-data">
                              {searchTerm ? 'Aucun formateur trouvé' : 'Aucun formateur disponible'}
                            </td>
                          </tr>
                        )
                      ) : activeTab === 'etudiants' ? (
                        filteredEtudiants.length > 0 ? 
                        (filteredEtudiants.map((etudiant) => (
                          <tr key={etudiant._id}>
                            <td>{etudiant.prenom} {etudiant.nom}</td>
                            <td>
                              <button 
                                onClick={() => {
                                  console.log('Email cliqué:', etudiant.email);
                                  fetchEtudiantDetails(etudiant.email);
                                }}
                                className="email-btn"
                              >
                                {etudiant.email}
                              </button>
                            </td>
                            <td>{new Date(etudiant.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))) : (
                          <tr>
                            <td colSpan={3} className="no-data">
                              {searchTerm ? 'Aucun étudiant trouvé' : 'Aucun étudiant disponible'}
                            </td>
                          </tr>
                        )
                      ) : (
                        filteredAdmins.length > 0 ? (
                          filteredAdmins.map((admin) => (
                            <tr key={admin._id}>
                              <td>{admin.prenom} {admin.nom}</td>
                              <td>{admin.email}</td>
                              <td>{admin.role || 'Admin'}</td>
                              <td className="actions">
                                <button 
                                  onClick={() => {
                                    setCurrentAdmin(admin);
                                    setShowAdminModal(true);
                                  }}
                                  className="edit-btn"
                                >
                                  <FaEdit />
                                </button>
                                <button 
                                  onClick={() => {
                                    setItemToDelete(admin._id);
                                    setShowDeleteConfirmation(true);
                                  }}
                                  className="delete-btn"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="no-data">
                              {searchTerm ? 'Aucun admin trouvé' : 'Aucun admin disponible'}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showAdminModal && (
        <AdminFormModal
          admin={currentAdmin}
          onClose={() => {
            setShowAdminModal(false);
            setCurrentAdmin(null);
          }}
          onSubmit={(formData) => {
            if (currentAdmin) {
              setFormDataToSave(formData);
              setShowSaveConfirmation(true);
            } else {
              handleAddAdmin(formData);
            }
          }}
        />
      )}

      {showFormateurModal && (
        <FormateurFormModal
          formateur={currentFormateur}
          onClose={() => {
            setShowFormateurModal(false);
            setCurrentFormateur(null);
          }}
          onSubmit={(formData) => {
            if (currentFormateur) {
              setFormateurDataToSave(formData);
              setShowSaveFormateurConfirmation(true);
            } else {
              handleAddFormateur(formData);
            }
          }}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          user={userProfile}
          onClose={() => setShowProfileModal(false)}
          onUpdateProfile={handleUpdateProfile}
          onChangePassword={handleChangePassword}
        />
      )}

      {showFormateurDetails && formateurDetails && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h3>
                <FaChalkboardTeacher style={{ marginRight: '10px' }} />
                Détails du formateur
              </h3>
              <button onClick={() => setShowFormateurDetails(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                <strong><FaUserCircle style={{ marginRight: '8px' }} />Nom:</strong> 
                {formateurDetails.prenom} {formateurDetails.nom}
              </p>
              <p>
                <strong><FaEnvelope style={{ marginRight: '8px' }} />Email:</strong> 
                {formateurDetails.email}
              </p>
              <p>
                <strong><FaGraduationCap style={{ marginRight: '8px' }} />Spécialité:</strong> 
                {formateurDetails.specialite}
              </p>
              <p>
                <strong><FaBook style={{ marginRight: '8px' }} />Nombre de cours:</strong> 
                {formateurDetails.courseCount}
              </p>
              <p>
                <strong><FaUserFriends style={{ marginRight: '8px' }} />Nombre d'abonnés:</strong> 
                {formateurDetails.followerCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {showEtudiantDetails && etudiantDetails && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h3>
                <FaUserGraduate style={{ marginRight: '10px' }} />
                Détails de l'étudiant
              </h3>
              <button onClick={() => setShowEtudiantDetails(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                <strong><FaUserCircle style={{ marginRight: '8px' }} />Nom:</strong> 
                {etudiantDetails.prenom} {etudiantDetails.nom}
              </p>
              <p>
                <strong><FaEnvelope style={{ marginRight: '8px' }} />Email:</strong> 
                {etudiantDetails.email}
              </p>
              <p>
                <strong><FaBookOpen style={{ marginRight: '8px' }} />Cours suivis:</strong> 
                {etudiantDetails.enrolledCoursesCount}
              </p>
              <p>
                <strong><FaCheckCircle style={{ marginRight: '8px' }} />Cours terminés:</strong> 
                {etudiantDetails.completedCoursesCount}
              </p>
              <p>
                <strong><FaChartLine style={{ marginRight: '8px' }} />Moyenne des quiz:</strong> 
                {etudiantDetails.averageQuizScore !== null 
                  ? `${etudiantDetails.averageQuizScore}% (sur ${etudiantDetails.quizAttempts} quiz)` 
                  : 'Aucun quiz complété'}
              </p>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <ConfirmationModal
          message="Êtes-vous sûr de vouloir supprimer cet admin ?"
          onConfirm={() => handleDeleteAdmin(itemToDelete)}
          onCancel={() => {
            setShowDeleteConfirmation(false);
            setItemToDelete(null);
          }}
          confirmButtonClass="delete-confirm-btn"
        />
      )}

      {showSaveConfirmation && (
        <ConfirmationModal
          message="Voulez-vous vraiment enregistrer ces modifications ?"
          onConfirm={handleUpdateAdmin}
          onCancel={() => {
            setShowSaveConfirmation(false);
            setFormDataToSave(null);
          }}
        />
      )}

      {showDeleteFormateurConfirmation && (
        <ConfirmationModal
          message="Êtes-vous sûr de vouloir supprimer ce formateur ?"
          onConfirm={() => handleDeleteFormateur(formateurToDelete)}
          onCancel={() => {
            setShowDeleteFormateurConfirmation(false);
            setFormateurToDelete(null);
          }}
          confirmButtonClass="delete-confirm-btn"
        />
      )}

      {showSaveFormateurConfirmation && (
        <ConfirmationModal
          message="Voulez-vous vraiment enregistrer ces modifications pour le formateur ?"
          onConfirm={handleUpdateFormateur}
          onCancel={() => {
            setShowSaveFormateurConfirmation(false);
            setFormateurDataToSave(null);
          }}
        />
      )}
    </div>
  );
}

export default AdminDashboard;