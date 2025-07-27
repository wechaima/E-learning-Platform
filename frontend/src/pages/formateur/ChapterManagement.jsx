import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SectionList from '../components/SectionList';
import api from '../services/api';
import '../styles/ChapterManagement.css';

const ChapterManagement = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    order: 0
  });

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await api.get(`/courses/${courseId}/chapters/${chapterId}`);
        setChapter(response.data);
        setFormData({
          title: response.data.title,
          order: response.data.order
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [courseId, chapterId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedChapter = await api.put(
        `/courses/${courseId}/chapters/${chapterId}`,
        formData
      );
      setChapter(updatedChapter.data);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteChapter = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ?')) {
      try {
        await api.delete(`/courses/${courseId}/chapters/${chapterId}`);
        navigate(`/courses/${courseId}`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAddSection = () => {
    navigate(`/courses/${courseId}/chapters/${chapterId}/sections/new`);
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;
  if (!chapter) return <div className="not-found">Chapitre non trouvé</div>;

  return (
    <div className="chapter-management">
      <div className="chapter-header">
        {editMode ? (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label>Titre</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Ordre</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Enregistrer
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditMode(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="chapter-info">
              <h1>{chapter.title}</h1>
              <p className="order">Ordre: {chapter.order}</p>
            </div>
            <div className="chapter-actions">
              <button
                onClick={() => setEditMode(true)}
                className="btn btn-primary"
              >
                Modifier le chapitre
              </button>
              <button
                onClick={handleAddSection}
                className="btn btn-success"
              >
                Ajouter une section
              </button>
              <button
                onClick={handleDeleteChapter}
                className="btn btn-danger"
              >
                Supprimer le chapitre
              </button>
            </div>
          </>
        )}
      </div>

      <div className="chapter-sections">
        <h2>Sections</h2>
        {chapter.sections && chapter.sections.length > 0 ? (
          <SectionList 
            sections={chapter.sections} 
            courseId={courseId} 
            chapterId={chapterId} 
          />
        ) : (
          <div className="no-sections">
            <p>Ce chapitre n'a pas encore de sections.</p>
            <button onClick={handleAddSection} className="btn btn-primary">
              Ajouter votre première section
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterManagement;