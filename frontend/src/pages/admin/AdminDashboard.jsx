import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaChalkboardTeacher, FaPlus, FaBars, 
  FaEdit, FaTrash, FaSignOutAlt 
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import api from '../../api/axios';
import './AdminDashboard.css';
import FormateurFormModal from './FormateurFormModal.jsx';


function AdminDashboard() {
  const [formateurs, setFormateurs] = useState([]);
  const [visiteurs, setVisiteurs] = useState([]);
  const [activeTab, setActiveTab] = useState('formateurs');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentFormateur, setCurrentFormateur] = useState(null);
  const navigate = useNavigate();

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
      const endpoint = activeTab === 'formateurs' ? '/formateurs' : '/visiteurs';
      const res = await api.get(endpoint);
      
      let data = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (typeof res.data === 'object') {
          data = [res.data];
        }
      }

      if (activeTab === 'formateurs') {
        setFormateurs(data);
      } else {
        setVisiteurs(data);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAddFormateur = async (formData) => {
    try {
      const res = await api.post('/auth/formateurs', formData);
      setFormateurs(prev => [...prev, res.data]);
      setShowModal(false);
      showSuccess('Formateur ajouté avec succès');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  };

  const handleUpdateFormateur = async (formData) => {
    try {
      const res = await api.put(`/formateurs/${currentFormateur._id}`, formData);
      setFormateurs(prev => 
        prev.map(f => f._id === currentFormateur._id ? res.data : f)
      );
      setShowModal(false);
      setCurrentFormateur(null);
      showSuccess('Formateur modifié avec succès');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteFormateur = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce formateur ?')) return;
    
    try {
      await api.delete(`/formateurs/${id}`);
      setFormateurs(prev => prev.filter(f => f._id !== id));
      showSuccess('Formateur supprimé avec succès');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
            {activeTab === 'formateurs' ? 'Gestion des formateurs' : 'Liste des visiteurs'}
          </h1>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Déconnexion
          </button>
        </header>

        <main className="admin-content">
          <div className="admin-card">
            <div className="card-header">
              <h2>
                {activeTab === 'formateurs' 
                  ? `Formateurs (${formateurs.length})` 
                  : `Visiteurs (${visiteurs.length})`}
              </h2>
              {activeTab === 'formateurs' && (
                <button 
                  onClick={() => {
                    setCurrentFormateur(null);
                    setShowModal(true);
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
                      ) : (
                        <>
                          <th>Nom</th>
                          <th>Email</th>
                          <th>Date inscription</th>
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
                                  setShowModal(true);
                                }}
                                className="edit-btn"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => handleDeleteFormateur(formateur._id)}
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
                    ) : (
                      visiteurs.length > 0 ? (
                        visiteurs.map((visiteur) => (
                          <tr key={visiteur._id}>
                            <td>{visiteur.prenom} {visiteur.nom}</td>
                            <td>{visiteur.email}</td>
                            <td>{new Date(visiteur.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="no-data">Aucun visiteur disponible</td>
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

      {showModal && (
        <FormateurFormModal
          formateur={currentFormateur}
          onClose={() => {
            setShowModal(false);
            setCurrentFormateur(null);
          }}
          onSubmit={currentFormateur ? handleUpdateFormateur : handleAddFormateur}
        />
      )}
    </div>
  );
}

export default AdminDashboard;