import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './CourseDetail.css';
import { FiChevronDown, FiChevronRight, FiArrowLeft } from 'react-icons/fi';

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
    type: 'section',
    chapterIndex: 0,
    sectionIndex: null,
    quiz: null,
  });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedChapters, setExpandedChapters] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState(null);

  // Fonction pour retourner au tableau de bord
  const handleBackToDashboard = () => {
    navigate('/etudiant');
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser({ ...parsedUser, token });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [courseRes, subscriptionRes] = await Promise.all([
          api.get(`/courses/${id}`),
          user ? api.get(`/courses/${id}/check-subscription`, {
            headers: { Authorization: `Bearer ${user.token}` }
          }) : Promise.resolve({ data: { isSubscribed: false } })
        ]);

        const courseData = courseRes.data.data;
        if (!courseData.chapters) courseData.chapters = [];
        
        setCourse(courseData);
        setIsSubscribed(subscriptionRes.data.isSubscribed);

        if (subscriptionRes.data.isSubscribed && courseData.chapters.length > 0 && courseData.chapters[0].sections.length > 0) {
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
  }, [id, user]);

  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterIndex)
        ? prev.filter((i) => i !== chapterIndex)
        : [...prev, chapterIndex]
    );
  };

  const handleSectionClick = async (chapterIndex, sectionIndex) => {
    if (!isSubscribed) return;
    
    setCurrentContent({ type: 'section', chapterIndex, sectionIndex, quiz: null });
    setQuizResult(null);
    setQuizAnswers({});

    try {
      const chapterId = course.chapters[chapterIndex]._id;
      const sectionId = course.chapters[chapterIndex].sections[sectionIndex]._id;
      console.log('Envoi de la progression:', { chapterId, sectionId });

      await api.post(
        `/courses/${id}/sections`,
        { chapterId, sectionId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );console.log('Envoi de la progression:', { chapterId, sectionId });

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
    if (!isSubscribed) return;
    setCurrentContent({ type: 'quiz', chapterIndex, sectionIndex: null, quiz });
    setQuizResult(null);
    setQuizAnswers({});
  };

  const handleAnswerChange = (questionId, optionIndex, isMultiple) => {
    if (!isSubscribed) return;
    setQuizAnswers((prev) => {
      if (isMultiple) {
        const currentAnswers = prev[questionId] || [];
        if (currentAnswers.includes(optionIndex)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter((i) => i !== optionIndex),
          };
        }
        return { ...prev, [questionId]: [...currentAnswers, optionIndex] };
      } else {
        return { ...prev, [questionId]: [optionIndex] };
      }
    });
  };

  const handleQuizSubmit = async () => {
    if (!isSubscribed) return;
    try {
      const chapterId = course.chapters[currentContent.chapterIndex]._id;
      const response = await api.post(
        `/courses/${id}/quizzes`,
        { chapterId, answers: quizAnswers },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
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

  const handleSubscribe = async () => {
    try {
      await api.post(
        `/courses/${id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` }}
      );
      setIsSubscribed(true);
      const response = await api.get(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCourse(response.data.data);
    } catch (err) {
      console.error('Subscription error:', err);
      setError("Erreur lors de l'abonnement au cours");
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
        <button onClick={handleBackToDashboard} className="back-button">
          <FiArrowLeft className="back-icon" />
          Retour au tableau de bord
        </button>

        <h2 className="course-title">{course.title}</h2>
        {isSubscribed ? (
          <div className="progress-info">
            Progression: {course.progress?.overallProgress || 0}%
          </div>
        ) : (
          <div className="subscribe-message">
            <p>Vous devez vous abonner pour accéder au contenu</p>
            {user && (
              <button onClick={handleSubscribe} className="subscribe-button">
                S'abonner
              </button>
            )}
            {!user && (
              <button 
                onClick={() => navigate('/login')} 
                className="subscribe-button"
              >
                Se connecter pour s'abonner
              </button>
            )}
          </div>
        )}
        
        {isSubscribed && (
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
                    {chapter.quiz && course.progress?.chapterProgress?.find(
                      cp => cp.chapterId.toString() === chapter._id
                    )?.quizCompleted && (
                      <span className="quiz-score">
                        {course.progress?.chapterProgress?.find(
                          cp => cp.chapterId.toString() === chapter._id
                        )?.quizScore}%
                      </span>
                    )}
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
                              )?.quizCompleted && (
                                <span className="quiz-score">
                                  {course.progress?.chapterProgress?.find(
                                    cp => cp.chapterId.toString() === chapter._id
                                  )?.quizScore}%
                                </span>
                              )}
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
        )}
      </aside>
      <main className="course-content">
        {!isSubscribed ? (
          <div className="subscribe-prompt">
            <h3>Abonnez-vous pour accéder au contenu du cours</h3>
            <p>Ce cours contient {safeChapters.length} chapitres avec du matériel d'apprentissage de qualité.</p>
            {user ? (
              <button onClick={handleSubscribe} className="subscribe-button large">
                S'abonner maintenant
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className="subscribe-button large"
              >
                Se connecter pour s'abonner
              </button>
            )}
          </div>
        ) : currentContent.type === 'section' && currentSection ? (
          <div className="section-content">
            <h3 className="section-title">{currentSection.title}</h3>
           {currentSection.videoUrl?.startsWith('http') && (
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
            {course.progress?.chapterProgress?.find(
              cp => cp.chapterId.toString() === safeChapters[currentContent.chapterIndex]._id
            )?.quizCompleted ? (
              <div className="quiz-result">
                <h4>Vous avez déjà complété ce quiz</h4>
                <p>Votre score: {course.progress?.chapterProgress?.find(
                  cp => cp.chapterId.toString() === safeChapters[currentContent.chapterIndex]._id
                )?.quizScore}%</p>
                <button
                  className="quiz-retry-button"
                  onClick={() => {
                    setCurrentContent({ 
                      type: 'quiz', 
                      chapterIndex: currentContent.chapterIndex, 
                      sectionIndex: null, 
                      quiz: currentQuiz 
                    });
                    setQuizResult(null);
                    setQuizAnswers({});
                  }}
                >
                  Refaire le quiz
                </button>
              </div>
            ) : quizResult?.submitted ? (
              <div className="quiz-result">
                <h4>Résultat: {quizResult.score}%</h4>
                <p>{quizResult.score >= 70 ? 'Réussi !' : 'Essayez encore.'}</p>
                <button
                  className="quiz-retry-button"
                  onClick={() => {
                    setQuizResult(null);
                    setQuizAnswers({});
                  }}
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
                          type={question.multipleAnswers ? "checkbox" : "radio"}
                          name={question._id}
                          checked={(quizAnswers[question._id] || []).includes(oIndex)}
                          onChange={() => handleAnswerChange(question._id, oIndex, question.multipleAnswers)}
                        />
                        {option.text}
                      </label>
                    ))}
                  </div>
                ))}
                <button type="submit" className="quiz-submit-button">
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