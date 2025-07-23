import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseDetail.css';
import api from '../../api/axios';
import { FiArrowLeft, FiCheckCircle, FiPlay, FiBarChart2 } from 'react-icons/fi';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('ID de cours invalide');
      setLoading(false);
      return;
    }
    const fetchCourse = async () => {
      try {
        console.log('Fetching course with ID:', id);
        const res = await api.get(`/courses/${id}`);
        if (res.data.success) {
          setCourse(res.data.data);
        } else {
          setError(res.data.message || 'Erreur lors du chargement du cours');
        }
        setLoading(false);
      } catch (err) {
        console.log('Error response:', err.response?.data);
        setError('Erreur lors du chargement du cours');
        setLoading(false);
        console.error(err);
      }
    };
    fetchCourse();
  }, [id]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleCompleteSection = async () => {
    try {
      await api.post('/progress/update', {
        courseId: id,
        progress: Math.min(100, ((activeSection + 1) / (course.sections.length || 1)) * 100)
      });
      
      if (activeSection < (course.sections.length - 1)) {
        setActiveSection(activeSection + 1);
      } else {
        await api.post('/progress/complete', { courseId: id });
        alert('Félicitations! Vous avez terminé ce cours!');
      }
    } catch (err) {
      console.error('Erreur mise à jour progression:', err);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!course) return <div className="not-found">Cours non trouvé</div>;

  const totalProgress = course.progress || 0;

  return (
    <div className="course-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FiArrowLeft /> Retour
      </button>

      <div className="course-header">
        <h1>{course.title}</h1>
        <div className="course-meta">
          <span className="course-instructor">Par: {course.createdBy?.prenom} {course.createdBy?.nom}</span>
          <span className="progress-bar">
            <FiBarChart2 /> Progression: {totalProgress}%
            <div className="progress-fill" style={{ width: `${totalProgress}%` }}></div>
          </span>
        </div>
        <p className="course-description">{course.description}</p>
      </div>

      <div className="course-content">
        <div className="sections-sidebar">
          <h3>Plan du cours</h3>
          <ul>
            {course.sections.map((section, index) => (
              <li
                key={section._id}
                className={index === activeSection ? 'active' : ''}
                onClick={() => setActiveSection(index)}
              >
                <span className="section-number">{index + 1}</span>
                <div className="section-info">
                  <h4>{section.title}</h4>
                  <p>{section.description.substring(0, 60)}...</p>
                </div>
                {index < activeSection && <FiCheckCircle className="completed-icon" />}
              </li>
            ))}
          </ul>
        </div>

        <div className="section-content">
          {!showQuiz ? (
            <>
              <div className="section-header">
                <h2>
                  <span className="section-number">{activeSection + 1}.</span>
                  {course.sections[activeSection].title}
                </h2>
                <p>{course.sections[activeSection].description}</p>
              </div>

              {course.sections[activeSection].videoUrl && (
                <div className="video-container">
                  <iframe
                    src={course.sections[activeSection].videoUrl}
                    title={course.sections[activeSection].title}
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div className="section-actions">
                {activeSection > 0 && (
                  <button
                    onClick={() => setActiveSection(activeSection - 1)}
                    className="secondary-button"
                  >
                    Précédent
                  </button>
                )}
                <button
                  onClick={handleCompleteSection}
                  className="primary-button"
                >
                  <FiPlay /> {activeSection < course.sections.length - 1 ? 'Suivant' : 'Terminer'}
                </button>
                {activeSection === course.sections.length - 1 && (
                  <button
                    onClick={handleStartQuiz}
                    className="quiz-button"
                  >
                    Quiz
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="quiz-container">
              <h2>Quiz: {course.title}</h2>
              <div className="quiz-content">
                <p>Contenu du quiz à implémenter (exemple : questions/réponses)</p>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="secondary-button"
                >
                  Retour
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;