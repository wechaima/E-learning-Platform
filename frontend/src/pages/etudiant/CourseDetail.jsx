import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './CourseDetail.css';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    _id: '',
    title: '',
    description: '',
    chapters: [],
    createdBy: { prenom: '', nom: '' },
    progress: null,
  });
  const [currentContent, setCurrentContent] = useState({
    type: 'section', // 'section' or 'quiz'
    chapterIndex: 0,
    sectionIndex: null,
    quiz: null,
  });
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionId: [selectedOptionIndices] }
  const [quizResult, setQuizResult] = useState(null); // { score, submitted }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedChapters, setExpandedChapters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/courses/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const courseData = response.data.data;
        if (!courseData.chapters) courseData.chapters = [];
        setCourse(courseData);
        if (courseData.chapters.length > 0 && courseData.chapters[0].sections.length > 0) {
          setCurrentContent({ type: 'section', chapterIndex: 0, sectionIndex: 0, quiz: null });
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement du cours');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterIndex)
        ? prev.filter((i) => i !== chapterIndex)
        : [...prev, chapterIndex]
    );
  };

  const handleSectionClick = async (chapterIndex, sectionIndex) => {
    setCurrentContent({ type: 'section', chapterIndex, sectionIndex, quiz: null });
    setQuizResult(null);
    setQuizAnswers({});

    try {
      const chapterId = course.chapters[chapterIndex]._id;
      const sectionId = course.chapters[chapterIndex].sections[sectionIndex]._id;
      await api.post(
        `/courses/${id}/sections`,
        { chapterId, sectionId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const response = await api.get(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCourse(response.data.data);
    } catch (err) {
      console.error('Progress update error:', err);
      setError('Erreur lors de la mise à jour de la progression');
    }
  };

  const handleQuizClick = (chapterIndex, quiz) => {
    setCurrentContent({ type: 'quiz', chapterIndex, sectionIndex: null, quiz });
    setQuizResult(null);
    setQuizAnswers({});
  };

  const handleAnswerChange = (questionId, optionIndex) => {
    setQuizAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      if (currentAnswers.includes(optionIndex)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((i) => i !== optionIndex),
        };
      }
      return { ...prev, [questionId]: [...currentAnswers, optionIndex] };
    });
  };

  const handleQuizSubmit = async () => {
    try {
      const chapterId = course.chapters[currentContent.chapterIndex]._id;
      const response = await api.post(
        `/courses/${id}/quizzes`,
        { chapterId, answers: quizAnswers },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setQuizResult({ score: response.data.data.score, submitted: true });
      const courseResponse = await api.get(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCourse(courseResponse.data.data);
    } catch (err) {
      console.error('Quiz submission error:', err);
      setError('Erreur lors de la soumission du quiz');
    }
  };

  const safeChapters = course.chapters || [];
  const currentSection =
    currentContent.type === 'section' &&
    safeChapters[currentContent.chapterIndex]?.sections[currentContent.sectionIndex];
  const currentQuiz = currentContent.type === 'quiz' && currentContent.quiz;

  if (loading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="retry-button">
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="detail-course-container">
      <aside className="course-sidebar">
        <h2 className="course-title">{course.title}</h2>
        <div className="progress-info">
          Progression: {course.progress?.overallProgress || 0}%
        </div>
        <nav className="chapters-list">
          {safeChapters.length === 0 ? (
            <div className="chapter empty">Aucun chapitre disponible</div>
          ) : (
            safeChapters.map((chapter, chapterIndex) => (
              <div
                key={chapter._id || `chapter-${chapterIndex}`}
                className={`chapter ${
                  currentContent.chapterIndex === chapterIndex ? 'active' : ''
                }`}
              >
                <button className="chapter-header" onClick={() => toggleChapter(chapterIndex)}>
                  <span className="chapter-icon">
                    {expandedChapters.includes(chapterIndex) ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronRight />
                    )}
                  </span>
                  <span className="chapter-title">
                    Chapitre {chapterIndex + 1}: {chapter.title}
                  </span>
                </button>
                {expandedChapters.includes(chapterIndex) && (
                  <ul className="sections-list">
                    {chapter.sections.length === 0 && !chapter.quiz ? (
                      <li className="section empty">Aucun contenu disponible</li>
                    ) : (
                      <>
                        {chapter.sections.map((section, sectionIndex) => (
                          <li
                            key={section._id || `section-${sectionIndex}`}
                            className={`section ${
                              currentContent.type === 'section' &&
                              currentContent.chapterIndex === chapterIndex &&
                              currentContent.sectionIndex === sectionIndex
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => handleSectionClick(chapterIndex, sectionIndex)}
                          >
                            {section.title}
                            {course.progress?.chapterProgress
                              ?.find((cp) => cp.chapterId.toString() === chapter._id)
                              ?.completedSections.includes(section._id) && (
                              <span className="completed-mark">✓</span>
                            )}
                          </li>
                        ))}
                        {chapter.quiz && (
                          <li
                            className={`section quiz ${
                              currentContent.type === 'quiz' &&
                              currentContent.chapterIndex === chapterIndex
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => handleQuizClick(chapterIndex, chapter.quiz)}
                          >
                            Quiz: {chapter.title}
                            {course.progress?.chapterProgress?.find(
                              (cp) => cp.chapterId.toString() === chapter._id
                            )?.quizCompleted && <span className="completed-mark">✓</span>}
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                )}
              </div>
            ))
          )}
        </nav>
      </aside>
      <main className="course-content">
        {currentContent.type === 'section' && currentSection ? (
          <div className="section-content">
            <h3 className="section-title">{currentSection.title}</h3>
            {currentSection.videoUrl && (
              <div className="video-container">
                <iframe
                  src={currentSection.videoUrl}
                  title={currentSection.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <div className="text-content">{currentSection.content || 'Aucun contenu disponible'}</div>
          </div>
        ) : currentContent.type === 'quiz' && currentQuiz ? (
          <div className="quiz-content">
            <h3 className="section-title">Quiz: {safeChapters[currentContent.chapterIndex].title}</h3>
            {quizResult?.submitted ? (
              <div className="quiz-result">
                <h4>Résultat: {quizResult.score}%</h4>
                <p>{quizResult.score >= 70 ? 'Réussi !' : 'Essayez encore.'}</p>
                <button
                  className="quiz-retry-button"
                  onClick={() => setQuizResult(null) && setQuizAnswers({})}
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <form
                className="quiz-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleQuizSubmit();
                }}
              >
                {currentQuiz.questions.map((question, qIndex) => (
                  <div key={question._id || `question-${qIndex}`} className="quiz-question">
                    <h4>{qIndex + 1}. {question.text}</h4>
                    {question.options.map((option, oIndex) => (
                      <label key={oIndex} className="quiz-option">
                        <input
                          type="checkbox"
                          checked={(quizAnswers[question._id] || []).includes(oIndex)}
                          onChange={() => handleAnswerChange(question._id, oIndex)}
                          disabled={quizResult?.submitted}
                        />
                        {option.text}
                      </label>
                    ))}
                  </div>
                ))}
                <button type="submit" className="quiz-submit-button" disabled={quizResult?.submitted}>
                  Soumettre
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="no-content">Aucun contenu sélectionné</div>
        )}
      </main>
    </div>
  );
};

export default CourseDetail;