import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaChalkboardTeacher, FaPlus, FaBars, 
  FaEdit, FaTrash, FaSignOutAlt, FaUserShield, FaBell, FaUserCircle 
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import api from '../../api/axios';
import './AdminDashboard.css';
import AdminFormModal from './AdminFormModal.jsx';
import FormateurFormModal from './FormateurFormModal.jsx';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal.jsx';

function AdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [activeTab, setActiveTab] = useState('formateurs');
  const [loading, setLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showFormateurModal, setShowFormateurModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentFormateur, setCurrentFormateur] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  // États pour les confirmations
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [formDataToSave, setFormDataToSave] = useState(null);
  const [showDeleteFormateurConfirmation, setShowDeleteFormateurConfirmation] = useState(false);
  const [formateurToDelete, setFormateurToDelete] = useState(null);
  const [showSaveFormateurConfirmation, setShowSaveFormateurConfirmation] = useState(false);
  const [formateurDataToSave, setFormateurDataToSave] = useState(null);

  useEffect(() => {
    
    fetchData();
  }, [activeTab]);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      let data = [];
      if (activeTab === 'formateurs') {
        const res = await api.get('/formateur');
        data = res.data.data || res.data || [];
        setFormateurs(data);
      } else if (activeTab === 'etudiants') {
        const res = await api.get('/etudiants');
        data = res.data.data || res.data || [];
        setEtudiants(data);
      } else if (activeTab === 'admins') {
        const res = await api.get('/auth/admins');
        data = res.data.data || res.data || [];
        setAdmins(data);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (formData) => {
    try {
      const res = await api.post('/auth/admins', formData);
      setAdmins(prev => [...prev, res.data]);
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
      if (currentAdmin._id === userProfile?.id) {
        setUserProfile(res.data); // Update user profile if self-edited
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
    setCurrentAdmin(userProfile);
    setShowAdminModal(true);
    setShowProfileDropdown(false);
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
      />
      
      <div className="admin-main-content">
        <header className="admin-header">
          <h1 className="admin-title">
            {activeTab === 'formateurs' ? 'Gestion des formateurs' 
             : activeTab === 'etudiants' ? 'Liste des étudiants' 
             : 'Gestion des admins'}
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
          <div className="admin-card">
            <div className="card-header">
              <h2>
                {activeTab === 'formateurs' ? `Formateurs (${formateurs.length})` 
                 : activeTab === 'etudiants' ? `Étudiants (${etudiants.length})` 
                 : `Admins (${admins.length})`}
              </h2>
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
                      formateurs.length > 0 ? (
                        formateurs.map((formateur) => (
                          <tr key={formateur._id}>
                            <td>{formateur.prenom} {formateur.nom}</td>
                            <td>{formateur.email}</td>
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
                          <td colSpan={4} className="no-data">Aucun formateur disponible</td>
                        </tr>
                      )
                    ) : activeTab === 'etudiants' ? (
                      etudiants.length > 0 ? (
                        etudiants.map((etudiant) => (
                          <tr key={etudiant._id}>
                            <td>{etudiant.prenom} {etudiant.nom}</td>
                            <td>{etudiant.email}</td>
                            <td>{new Date(etudiant.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="no-data">Aucun étudiant disponible</td>
                        </tr>
                      )
                    ) : (
                      admins.length > 0 ? (
                        admins.map((admin) => (
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
                          <td colSpan={4} className="no-data">Aucun admin disponible</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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

      {/* Modals de confirmation */}
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