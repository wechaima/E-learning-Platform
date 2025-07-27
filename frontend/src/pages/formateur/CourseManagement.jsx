import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChapterList from '../components/ChapterList';
import api from '../services/api';
import '../styles/CourseManagement.css';

const CourseManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: ''
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data);
        setFormData({
          title: response.data.title,
          description: response.data.description,
          imageUrl: response.data.imageUrl,
          category: response.data.category
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

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
      const updatedCourse = await api.put(`/courses/${courseId}`, formData);
      setCourse(updatedCourse.data);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddChapter = () => {
    navigate(`/courses/${courseId}/chapters/new`);
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;
  if (!course) return <div className="not-found">Cours non trouvé</div>;

  return (
    <div className="course-management">
      <div className="course-header">
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
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                rows="5"
                required
              />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Catégorie</label>
              <input
                type="text"
                name="category"
                value={formData.category}
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
            <div className="course-info">
              <img 
                src={course.imageUrl || '/default-course.jpg'} 
                alt={course.title} 
                className="course-image"
              />
              <div className="course-details">
                <h1>{course.title}</h1>
                <p className="category">{course.category}</p>
                <p className="students">{course.followers?.length || 0} apprenants</p>
                <p className="description">{course.description}</p>
              </div>
            </div>
            <div className="course-actions">
              <button
                onClick={() => setEditMode(true)}
                className="btn btn-primary"
              >
                Modifier le cours
              </button>
              <button
                onClick={handleAddChapter}
                className="btn btn-success"
              >
                Ajouter un chapitre
              </button>
            </div>
          </>
        )}
      </div>

      <div className="course-chapters">
        <h2>Chapitres</h2>
        {course.chapters && course.chapters.length > 0 ? (
          <ChapterList 
            chapters={course.chapters} 
            courseId={courseId} 
          />
        ) : (
          <div className="no-chapters">
            <p>Ce cours n'a pas encore de chapitres.</p>
            <button onClick={handleAddChapter} className="btn btn-primary">
              Ajouter votre premier chapitre
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;