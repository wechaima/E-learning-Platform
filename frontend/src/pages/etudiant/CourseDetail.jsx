import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './CourseDetail.css';

// Lazy loading des composants lourds
const QuestionForm = lazy(() => import('../../components/Notification/QuestionForm'));

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    _id: '',
    title: '',
    chapters: [],
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
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [studentMessages, setStudentMessages] = useState([]);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);

  // Initialize user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      setUser({ ...JSON.parse(userData), token });
    }
  }, []);

  // Fetch course data and subscription status
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [courseRes, subscriptionRes] = await Promise.all([
          api.get(`/courses/${id}`, {
            headers: user ? { Authorization: `Bearer ${user.token}` } : {},
          }),
          user ? api.get(`/courses/${id}/check-subscription`, {
            headers: { Authorization: `Bearer ${user.token}` }
          }) : Promise.resolve({ data: { isSubscribed: false } })
        ]);

        const courseData = courseRes.data.data;
        courseData.chapters = courseData.chapters || [];
        
        setCourse(courseData);
        setIsSubscribed(subscriptionRes.data.isSubscribed);

        if (subscriptionRes.data.isSubscribed && courseData.chapters.length > 0) {
          const firstChapter = courseData.chapters[0];
          if (firstChapter.sections.length > 0) {
            setCurrentContent({ type: 'section', chapterIndex: 0, sectionIndex: 0, quiz: null });
          } else if (firstChapter.quiz) {
            setCurrentContent({ type: 'quiz', chapterIndex: 0, sectionIndex: null, quiz: firstChapter.quiz });
          }
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

  // Fetch student messages
  useEffect(() => {
    if (user?.role === 'etudiant' && isSubscribed) {
      fetchStudentMessages();
    }
  }, [user, isSubscribed]);

  // Reset quiz state when switching to a quiz
  useEffect(() => {
    if (currentContent.type === 'quiz' && course.progress) {
      const chapterProgress = course.progress.chapterProgress?.find(
        (cp) => cp.chapterId.toString() === course.chapters[currentContent.chapterIndex]?._id
      );
      if (chapterProgress?.quizCompleted) {
        setQuizResult({ 
          score: chapterProgress.quizScore, 
          submitted: true,
          // Pour afficher les réponses correctes même après soumission
          showCorrectAnswers: true 
        });
        setQuizAnswers({});
      } else {
        setQuizResult(null);
        setQuizAnswers({});
      }
    }
  }, [currentContent, course.progress, course.chapters]);

  const fetchStudentMessages = async () => {
    try {
      const response = await api.get('/messages/student', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const filtered = (response.data.data || []).filter(
        (msg) => msg.course && msg.course._id === id
      );
      setStudentMessages(filtered);
    } catch (err) {
      console.error('Error fetching student messages:', err);
    }
  };

  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterIndex)
        ? prev.filter((i) => i !== chapterIndex)
        : [...prev, chapterIndex]
    );
  };

  const handleSectionClick = async (chapterIndex, sectionIndex) => {
    if (!isSubscribed) {
      alert('Vous devez vous abonner pour accéder au contenu.');
      return;
    }

    if (!isValidContent(chapterIndex, sectionIndex, 'section')) return;

    setCurrentContent({ type: 'section', chapterIndex, sectionIndex, quiz: null });
    setQuizResult(null);
    setQuizAnswers({});

    try {
      const chapterId = course.chapters[chapterIndex]._id;
      const sectionId = course.chapters[chapterIndex].sections[sectionIndex]._id;
      await api.post(
        `/courses/${id}/sections`,
        { chapterId, sectionId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const response = await api.get(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCourse(response.data.data);
    } catch (err) {
      console.error('Progress update error:', err);
      setError('Erreur lors de la mise à jour de la progression');
      alert('Erreur lors de la mise à jour de la progression.');
    }
  };

  const handleQuizClick = (chapterIndex, quiz) => {
    if (!isSubscribed) {
      alert('Vous devez vous abonner pour accéder au quiz.');
      return;
    }

    if (!isValidContent(chapterIndex, null, 'quiz')) return;

    setCurrentContent({ type: 'quiz', chapterIndex, sectionIndex: null, quiz });
  };

  const handleAnswerChange = (questionId, optionIndex, isMultiple) => {
    if (!isSubscribed) return;
    setQuizAnswers((prev) => {
      if (isMultiple) {
        const currentAnswers = prev[questionId] || [];
        return {
          ...prev,
          [questionId]: currentAnswers.includes(optionIndex)
            ? currentAnswers.filter((i) => i !== optionIndex)
            : [...currentAnswers, optionIndex],
        };
      }
      return { ...prev, [questionId]: [optionIndex] };
    });
  };

  const handleQuizSubmit = async () => {
    if (!isSubscribed) {
      alert('Vous devez vous abonner pour soumettre le quiz.');
      return;
    }

    try {
      const chapterId = course.chapters[currentContent.chapterIndex]._id;
      const response = await api.post(
        `/courses/${id}/quizzes`,
        { 
          chapterId, 
          answers: quizAnswers,
          retry: !!quizResult,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      setQuizResult({
        score: response.data.data.score,
        submitted: true,
        questionResults: response.data.data.questionResults,
        showCorrectAnswers: true
      });
      
      const courseResponse = await api.get(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCourse(courseResponse.data.data);
      alert(`Quiz soumis ! Score: ${response.data.data.score}%`);
    } catch (err) {
      console.error('Quiz submission error:', err);
      setError('Erreur lors de la soumission du quiz');
      alert('Erreur lors de la soumission du quiz.');
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
      if (response.data.data.chapters.length > 0) {
        const firstChapter = response.data.data.chapters[0];
        if (firstChapter.sections.length > 0) {
          setCurrentContent({ type: 'section', chapterIndex: 0, sectionIndex: 0, quiz: null });
        } else if (firstChapter.quiz) {
          setCurrentContent({ type: 'quiz', chapterIndex: 0, sectionIndex: null, quiz: firstChapter.quiz });
        }
      }
      alert('Abonnement réussi ! Vous pouvez maintenant accéder au contenu.');
    } catch (err) {
      console.error('Subscription error:', err);
      setError("Erreur lors de l'abonnement au cours");
      alert("Erreur lors de l'abonnement au cours.");
    }
  };

  const handleAskQuestion = () => {
    if (!isSubscribed) {
      setError('Vous devez être abonné pour poser des questions');
      alert('Vous devez être abonné pour poser des questions.');
      return;
    }
    setShowQuestionForm(true);
  };

  const isValidContent = (chapterIndex, sectionIndex, type) => {
    if (chapterIndex < 0 || chapterIndex >= course.chapters.length) return false;
    if (type === 'section' && (sectionIndex < 0 || sectionIndex >= course.chapters[chapterIndex].sections.length)) {
      return false;
    }
    if (type === 'quiz' && !course.chapters[chapterIndex].quiz) return false;
    return true;
  };

  // Composant VideoPlayer simplifié
  const VideoPlayer = ({ url, title }) => {
    if (!url) return null;
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      if (videoId) {
        return (
          <div className="video-container">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      }
    }
    
    return (
      <div className="video-container">
        <video controls>
          <source src={url} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>
    );
  };

  // Composant pour afficher les réponses correctes après quiz
  const CorrectAnswersDisplay = ({ quiz }) => {
    if (!quiz || !quiz.questions) return null;
    
    return (
      <div className="correct-answers-display">
        <h5>Réponses correctes :</h5>
        {quiz.questions.map((question, index) => {
          const correctOptions = question.options
            .filter(opt => opt.isCorrect)
            .map((opt, idx) => ({
              index: idx,
              text: typeof opt === 'string' ? opt : opt.text || `Option ${idx + 1}`
            }));

          return (
            <div key={question._id || `question-${index}`} className="question-answer">
              <h6>{index + 1}. {question.text || 'Question sans texte'}</h6>
              <p>
                <strong>Réponse correcte :</strong>{' '}
                {correctOptions.map(opt => opt.text).join(', ')}
              </p>
              {question.explanation && question.explanation !== 'Aucune explication fournie.' && (
                <p>
                  <strong>Explication :</strong> {question.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const safeChapters = course.chapters || [];
  const currentSection =
    currentContent.type === 'section' &&
    isValidContent(currentContent.chapterIndex, currentContent.sectionIndex, 'section') ?
    safeChapters[currentContent.chapterIndex].sections[currentContent.sectionIndex] : null;
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
        <button onClick={() => navigate(user?.role === 'formateur' ? '/formateur' : '/etudiant')} className="back-button">
          ← Retour au tableau de bord
        </button>
        <h2 className="course-title">{course.title || 'Cours sans titre'}</h2>
        {isSubscribed ? (
          <div className="progress-info">
            Progression: {course.progress?.overallProgress || 0}%
          </div>
        ) : (
          <div className="subscribe-message">
            <p>Vous devez vous abonner pour accéder au contenu</p>
            {user ? (
              <button onClick={handleSubscribe} className="subscribe-button">
                S'abonner
              </button>
            ) : (
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
                      {expandedChapters.includes(chapterIndex) ? '▼' : '▶'}
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
                              } ${section.videoUrl ? 'has-video' : ''}`}
                              onClick={() => handleSectionClick(chapterIndex, sectionIndex)}
                            >
                              <div className="section-content">
                                {section.videoUrl && <span className="video-icon">▶</span>}
                                <span className="section-title">{section.title}</span>
                              </div>
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
            {currentSection.videoUrl && (
              <VideoPlayer url={currentSection.videoUrl} title={currentSection.title} />
            )}
            <div 
              className="text-content" 
              dangerouslySetInnerHTML={{ __html: currentSection.content || 'Aucun contenu disponible' }}
            />
            {isSubscribed && (
              <div className="floating-question-buttons">
                <button 
                  className="ask-question-btn"
                  onClick={handleAskQuestion}
                >
                  💬 Poser une question
                </button>
                {studentMessages.length > 0 && (
                  <button 
                    className="view-messages-btn"
                    onClick={() => setShowMessagesPanel(true)}
                  >
                    📩 Voir mes questions ({studentMessages.length})
                  </button>
                )}
              </div>
            )}
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
                
                {/* AFFICHAGE DES RÉPONSES CORRECTES */}
                <CorrectAnswersDisplay quiz={currentQuiz} />
              </div>
            ) : quizResult?.submitted ? (
              <div className="quiz-result">
                <h4>Résultat du quiz: {quizResult.score}%</h4>
                <p className="result-message">
                  {quizResult.score >= 70 ? '🎉 Félicitations ! Vous avez réussi le quiz.' : '📚 Continuez à apprendre, vous y êtes presque !'}
                </p>
                
                {/* Résultats détaillés avec lazy loading */}
                {quizResult.questionResults && (
                  <Suspense fallback={<div>Chargement des résultats...</div>}>
                    <QuizDetailedResults 
                      results={quizResult.questionResults}
                      quiz={currentQuiz}
                      onRetry={() => {
                        setQuizResult(null);
                        setQuizAnswers({});
                      }}
                    />
                  </Suspense>
                )}
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
                    <h4>{qIndex + 1}. {question.text || 'Question sans texte'}</h4>
                    {question.options.map((option, oIndex) => (
                      <label key={oIndex} className="quiz-option">
                        <input
                          type={question.multipleAnswers ? "checkbox" : "radio"}
                          name={question._id}
                          checked={(quizAnswers[question._id] || []).includes(oIndex)}
                          onChange={() => handleAnswerChange(question._id, oIndex, question.multipleAnswers)}
                        />
                        {typeof option === 'string' ? option : option.text || `Option ${oIndex + 1}`}
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
      
      {/* Lazy loaded modals */}
      {showQuestionForm && (
        <Suspense fallback={<div className="loading-modal">Chargement du formulaire...</div>}>
          <QuestionForm 
            courseId={id}
            chapterId={safeChapters[currentContent.chapterIndex]?._id}
            sectionId={currentSection?._id}
            onClose={() => setShowQuestionForm(false)}
            user={user}
            onQuestionSent={() => {
              setShowQuestionForm(false);
              fetchStudentMessages();
              alert('Question envoyée avec succès !');
            }}
          />
        </Suspense>
      )}
      
      {showMessagesPanel && (
        <Suspense fallback={<div className="loading-modal">Chargement des messages...</div>}>
          <StudentMessagesPanel 
            messages={studentMessages}
            onClose={() => setShowMessagesPanel(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default CourseDetail;