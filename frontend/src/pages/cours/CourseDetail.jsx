import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiCheckCircle, 
  FiChevronDown, 
  FiChevronUp,
  FiBarChart2
} from 'react-icons/fi';

import './CourseDetail.css';

const CourseDetail = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les données du cours (remplacer par votre appel API)
        const courseRes = await fetchCourseData(courseId);
        setCourse(courseRes.data);

        // Charger ou initialiser la progression
        try {
          const progressRes = await getProgress(courseId);
          setProgress(progressRes.data);
        } catch (err) {
          if (err.response?.status === 404) {
            const newProgress = await initializeProgress(courseId);
            setProgress(newProgress.data);
          } else {
            throw err;
          }
        }

      } catch (err) {
        setError(err.response?.data?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const toggleChapter = (chapterIndex) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex]
    }));
  };

  const handleSectionSelect = async (chapterIndex, sectionIndex, sectionId) => {
    // Vérifier si la section précédente est complétée
    if (sectionIndex > 0) {
      const prevSection = course.chapters[chapterIndex].sections[sectionIndex - 1];
      if (!progress?.completedSections?.includes(prevSection._id)) {
        alert('Veuillez compléter la section précédente avant de continuer');
        return;
      }
    }

    setActiveChapter(chapterIndex);
    setActiveSection(sectionIndex);
  };

  const handleCompleteSection = async () => {
    try {
      const sectionId = course.chapters[activeChapter].sections[activeSection]._id;
      
      // Mettre à jour la progression
      const updatedProgress = await updateProgress(courseId, sectionId);
      setProgress(updatedProgress.data);

      // Passer à la section suivante si disponible
      if (activeSection < course.chapters[activeChapter].sections.length - 1) {
        setActiveSection(activeSection + 1);
      } else if (activeChapter < course.chapters.length - 1) {
        setActiveChapter(activeChapter + 1);
        setActiveSection(0);
      } else {
        // Terminer le cours si c'est la dernière section
        await completeCourse(courseId);
        alert('Félicitations! Vous avez terminé ce cours!');
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la mise à jour de la progression');
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!course) return <div className="not-found">Cours non trouvé</div>;

  return (
    <div className="course-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FiArrowLeft /> Retour
      </button>

      <div className="course-header">
        <h1>{course.title}</h1>
        <div className="progress-display">
          <FiBarChart2 /> Progression: {progress?.progress || 0}%
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress?.progress || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="course-content">
        <div className="sections-sidebar">
          <h3>Plan du cours</h3>
          {course.chapters.map((chapter, chapterIndex) => (
            <div key={chapter._id} className="chapter-item">
              <div 
                className="chapter-header"
                onClick={() => toggleChapter(chapterIndex)}
              >
                <h4>
                  <span className="chapter-number">{chapterIndex + 1}.</span>
                  {chapter.title}
                </h4>
                {expandedChapters[chapterIndex] ? <FiChevronUp /> : <FiChevronDown />}
              </div>

              {expandedChapters[chapterIndex] && (
                <ul className="sections-list">
                  {chapter.sections.map((section, sectionIndex) => (
                    <li
                      key={section._id}
                      className={`section-item ${
                        chapterIndex === activeChapter && 
                        sectionIndex === activeSection ? 'active' : ''
                      } ${
                        progress?.completedSections?.includes(section._id) ? 'completed' : ''
                      }`}
                      onClick={() => handleSectionSelect(
                        chapterIndex, 
                        sectionIndex, 
                        section._id
                      )}
                    >
                      <span className="section-number">
                        {chapterIndex + 1}.{sectionIndex + 1}
                      </span>
                      <span className="section-title">{section.title}</span>
                      {progress?.completedSections?.includes(section._id) && (
                        <FiCheckCircle className="completed-icon" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="section-content">
          {course.chapters[activeChapter]?.sections[activeSection] ? (
            <>
              <div className="section-header">
                <h2>
                  <span className="section-number">
                    {activeChapter + 1}.{activeSection + 1}
                  </span>
                  {course.chapters[activeChapter].sections[activeSection].title}
                </h2>
                <p>
                  {course.chapters[activeChapter].sections[activeSection].description}
                </p>
              </div>

              <div className="section-media">
                {course.chapters[activeChapter].sections[activeSection].videoUrl && (
                  <div className="video-container">
                    <iframe
                      src={course.chapters[activeChapter].sections[activeSection].videoUrl}
                      title={course.chapters[activeChapter].sections[activeSection].title}
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>

              <div className="section-actions">
                <button
                  onClick={handleCompleteSection}
                  className="complete-button"
                  disabled={progress?.completedSections?.includes(
                    course.chapters[activeChapter].sections[activeSection]._id
                  )}
                >
                  Marquer comme complété
                </button>
              </div>
            </>
          ) : (
            <div className="no-section">
              Sélectionnez une section pour commencer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;