import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './CourseDetail.css';
import { FiChevronDown, FiChevronRight, FiArrowLeft, FiPlay, FiMessageSquare } from 'react-icons/fi';
import QuestionForm from '../../components/Notification/QuestionForm';

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
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [studentMessages, setStudentMessages] = useState([]);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);

  const handleBackToDashboard = () => {
    navigate(user?.role === 'formateur' ? '/formateur' : '/etudiant');
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
    if (user && user.role === 'formateur') {
      fetchUnreadMessagesCount();
    }
  }, [user]);

  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await api.get('/messages/unread-count', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUnreadMessagesCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread messages count:', err);
    }
  };

  const fetchStudentMessages = async () => {
    try {
      const response = await api.get('/messages/student', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const allMessages = response.data.data || [];

      // Filtrer uniquement les messages du cours courant
      const filtered = allMessages.filter(
        (msg) => msg.course && msg.course._id === id
      );

      setStudentMessages(filtered);
    } catch (err) {
      console.error('Error fetching student messages:', err);
    }
  };

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

  useEffect(() => {
    if (user && user.role === 'etudiant' && isSubscribed) {
      fetchStudentMessages();
    }
  }, [user, isSubscribed]);

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

  const handleAskQuestion = () => {
    if (!isSubscribed) {
      setError('Vous devez être abonné pour poser des questions');
      return;
    }
    setShowQuestionForm(true);
  };

  // Fonction pour extraire l'ID d'une vidéo YouTube
  const getYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  // Fonction pour déterminer le type de vidéo
  const getVideoType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return 'direct';
    } else {
      return 'unknown';
    }
  };

  // Composant pour afficher la vidéo en fonction de son type
  const VideoPlayer = ({ url, title }) => {
    if (!url) return null;
    
    const videoType = getVideoType(url);
    
    switch (videoType) {
      case 'youtube':
        const videoId = getYouTubeId(url);
        return (
          <div className="video-container">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      
      case 'vimeo':
        const vimeoId = url.split('/').pop();
        return (
          <div className="video-container">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              title={title}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      
      case 'direct':
        return (
          <div className="video-container">
            <video controls>
              <source src={url} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        );
      
      default:
        return (
          <div className="video-error">
            <p>Format de vidéo non supporté. Lien direct: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
          </div>
        );
    }
  };

  // Composant pour afficher les messages de l'étudiant
  const StudentMessagesPanel = ({ messages, onClose }) => {
    const [expandedMessages, setExpandedMessages] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'answered', 'pending'

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const toggleMessage = (messageId) => {
      setExpandedMessages(prev =>
        prev.includes(messageId)
          ? prev.filter(id => id !== messageId)
          : [...prev, messageId]
      );
    };

    const filteredMessages = messages.filter(message => {
      if (filter === 'answered') return message.response;
      if (filter === 'pending') return !message.response;
      return true;
    });

    const answeredCount = messages.filter(m => m.response).length;
    const pendingCount = messages.filter(m => !m.response).length;

    return (
      <div className="student-messages-overlay">
        <div className="student-messages-container">
          <div className="student-messages-header">
            <h3>Vos questions et réponses</h3>
            <button onClick={onClose} className="close-btn">
              &times;
            </button>
          </div>

          {/* Filtres et statistiques */}
          <div className="messages-filters">
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                Toutes ({messages.length})
              </button>
              <button 
                className={filter === 'answered' ? 'active' : ''}
                onClick={() => setFilter('answered')}
              >
                Répondues ({answeredCount})
              </button>
              <button 
                className={filter === 'pending' ? 'active' : ''}
                onClick={() => setFilter('pending')}
              >
                En attente ({pendingCount})
              </button>
            </div>
          </div>
          
          <div className="student-messages-list">
            {filteredMessages.length === 0 ? (
              <div className="no-messages">
                <p>
                  {filter === 'answered' 
                    ? "Aucune question répondue pour le moment." 
                    : filter === 'pending'
                    ? "Aucune question en attente de réponse."
                    : "Vous n'avez pas encore posé de questions sur ce cours."
                  }
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div key={message._id} className={`message-item ${message.response ? 'answered' : 'pending'}`}>
                  <div 
                    className="message-summary"
                    onClick={() => toggleMessage(message._id)}
                  >
                    <div className="message-info">
                      <h4 className="message-course">{message.course?.title}</h4>
                      {message.chapter && (
                        <p className="message-chapter">Chapitre: {message.chapter.title}</p>
                      )}
                      <p className="question-preview">
                        {message.question.length > 100 
                          ? `${message.question.substring(0, 100)}...` 
                          : message.question
                        }
                      </p>
                      <p className="message-date">Posée le: {formatDate(message.createdAt)}</p>
                      <span className="message-status">
                        {message.response ? '✓ Répondu' : '⏳ En attente'}
                      </span>
                    </div>
                    <span className="expand-icon">
                      {expandedMessages.includes(message._id) ? '−' : '+'}
                    </span>
                  </div>
                  
                  {expandedMessages.includes(message._id) && (
                    <div className="message-details">
                      <div className="message-question-full">
                        <h5>Votre question:</h5>
                        <p className="question-text">{message.question}</p>
                      </div>
                      
                      {message.response ? (
                        <div className="message-response">
                          <h5>Réponse du formateur:</h5>
                          <p className="response-text">{message.response}</p>
                          <p className="response-date">Répondu le: {formatDate(message.respondedAt)}</p>
                        </div>
                      ) : (
                        <div className="message-pending">
                          <p className="pending-text">En attente de réponse du formateur...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
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
                              } ${section.videoUrl ? 'has-video' : ''}`}
                              onClick={() => handleSectionClick(chapterIndex, sectionIndex)}
                            >
                              <div className="section-content">
                                {section.videoUrl && <FiPlay className="video-icon" />}
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
            
            {/* Affichage de la vidéo intégrée dans le contenu */}
            {currentSection.videoUrl && (
              <VideoPlayer url={currentSection.videoUrl} title={currentSection.title} />
            )}
            
            <div 
              className="text-content" 
              dangerouslySetInnerHTML={{ __html: currentSection.content || 'Aucun contenu disponible' }}
            />
            
            {/* Boutons flottants */}
            {isSubscribed && (
              <div className="floating-question-buttons">
                <button 
                  className="ask-question-btn"
                  onClick={handleAskQuestion}
                >
                  <FiMessageSquare /> Poser une question
                </button>

                {studentMessages.length > 0 && (
                  <button 
                    className="view-messages-btn"
                    onClick={() => setShowMessagesPanel(true)}
                  >
                    <FiMessageSquare /> Voir mes questions ({studentMessages.length})
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
                    <h4>{qIndex + 1}. {question.text || 'Question sans texte'}</h4>
                    {question.options.map((option, oIndex) => (
                      <label key={oIndex} className="quiz-option">
                        <input
                          type={question.multipleAnswers ? "checkbox" : "radio"}
                          name={question._id}
                          checked={(quizAnswers[question._id] || []).includes(oIndex)}
                          onChange={() => handleAnswerChange(question._id, oIndex, question.multipleAnswers)}
                        />
                        {option.text || option}
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
      
      {showQuestionForm && (
        <QuestionForm 
          courseId={id}
          chapterId={course.chapters[currentContent.chapterIndex]._id}
          sectionId={currentSection._id}
          onClose={() => setShowQuestionForm(false)}
          user={user}
          onQuestionSent={() => {
            setShowQuestionForm(false);
            fetchStudentMessages(); // Recharger les messages après envoi
          }}
        />
      )}
      
      {showMessagesPanel && (
        <StudentMessagesPanel 
          messages={studentMessages}
          onClose={() => setShowMessagesPanel(false)}
        />
      )}
    </div>
  );
};

export default CourseDetail;