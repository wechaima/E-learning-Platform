import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronRight, FiArrowLeft, FiPlay, FiMessageSquare, FiArrowRight, FiArrowLeft as FiArrowLeftNav } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api/axios';
import QuestionForm from '../../components/Notification/QuestionForm';
import './CourseDetail.css';
//*****
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
 
  const [studentMessages, setStudentMessages] = useState([]);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);

  // Composant pour l'affichage détaillé des résultats du quiz
  const QuizDetailedResults = ({ results, overallStats, onRetry }) => {
    const [expandedQuestions, setExpandedQuestions] = useState([]);

    const toggleQuestion = (questionId) => {
      setExpandedQuestions(prev =>
        prev.includes(questionId)
          ? prev.filter(id => id !== questionId)
          : [...prev, questionId]
      );
    };

    const getScoreColor = (percentage) => {
      if (percentage >= 80) return '#4caf50';
      if (percentage >= 60) return '#ff9800';
      return '#f44336';
    };

    const getScoreEmoji = (percentage) => {
      if (percentage >= 80) return '🎉';
      if (percentage >= 60) return '👍';
      return '👎';
    };

    return (
      <div className="quiz-detailed-results">
        {/* Résumé global */}
        <div className="quiz-summary">
          <h4>Résumé du quiz</h4>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Score final</span>
              <span className="stat-value" style={{ color: getScoreColor(overallStats.averagePercentage) }}>
                {overallStats.averagePercentage}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Questions correctes</span>
              <span className="stat-value">
                {overallStats.correctQuestions}/{overallStats.totalQuestions}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Performance</span>
              <span className="stat-emoji">
                {getScoreEmoji(overallStats.averagePercentage)}
              </span>
            </div>
          </div>
        </div>

        {/* Détails par question */}
        <div className="questions-breakdown">
          <h5>Détail des questions</h5>
          {results.map((result, index) => (
            <div key={result.questionId} className="question-breakdown">
              <div 
                role ="button"
                tabIndex="0"
                className="question-header"
                onClick={() => toggleQuestion(result.questionId)}
              >
                <div className="question-info">
                  <span className="question-number">Question {index + 1}</span>
                  <span className={`question-status ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                    {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                  <span 
                    className="score-percentage"
                    style={{ color: getScoreColor(result.statistics.percentage) }}
                  >
                    {result.statistics.percentage}% de réussite
                  </span>
                </div>
                <span className="expand-icon">
                  {expandedQuestions.includes(result.questionId) ? '−' : '+'}
                </span>
              </div>

              {expandedQuestions.includes(result.questionId) && (
                <div className="question-details">
                  <div className="question-text">
                    <strong>Question:</strong> {result.questionText}
                  </div>

                  <div className="answers-comparison">
                    <div className="user-answers">
                      <strong>Vos réponses:</strong>
                      {result.userAnswers.length > 0 ? (
                        <ul>
                          {result.userAnswers.map((answer, idx) => (
                            <li 
                              key={idx}
                              className={result.correctAnswers.some(ca => ca.index === answer.index) 
                                ? 'correct-answer' 
                                : 'incorrect-answer'
                              }
                            >
                              {answer.text}
                              {result.correctAnswers.some(ca => ca.index === answer.index) 
                                ? ' ✓' 
                                : ' ✗'
                              }
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Aucune réponse sélectionnée</p>
                      )}
                    </div>

                    <div className="correct-answers">
                      <strong>Réponses correctes:</strong>
                      <ul>
                        {result.correctAnswers.map((answer, idx) => (
                          <li key={idx}>✓ {answer.text}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {result.explanation && result.explanation !== 'Aucune explication fournie.' && (
                    <div className="explanation">
                      <strong>Explication:</strong>
                      <p>{result.explanation}</p>
                    </div>
                  )}

                  <div className="question-statistics">
                    <div className="stat">
                      <span>Réponses correctes: </span>
                      <strong>{result.statistics.userCorrectCount}/{result.statistics.correctOptionsCount}</strong>
                    </div>
                    <div className="stat">
                      <span>Pourcentage de réussite: </span>
                      <strong style={{ color: getScoreColor(result.statistics.percentage) }}>
                        {result.statistics.percentage}%
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="quiz-retry-button" onClick={onRetry}>
          Réessayer le quiz
        </button>
      </div>
    );
  };

  // Initialize user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser({ ...parsedUser, token });
    }
  }, []);

  // Fetch unread messages count for formateur
  
  useEffect(() => {
    if (user?.role === 'formateur') {
      fetchUnreadMessagesCount();
    }
  }, [user]);

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

        // Initialize currentContent to first valid section or quiz
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

  // Fetch student messages for etudiant
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
        setQuizResult({ score: chapterProgress.quizScore, submitted: true });
        setQuizAnswers({});
      } else {
        setQuizResult(null);
        setQuizAnswers({});
      }
    }
  }, [currentContent, course.progress, course.chapters]);

  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await api.get('/messages/unread-count', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    
    } catch (err) {
      console.error('Error fetching unread messages count:', err);
    }
  };

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
      toast.warn('Vous devez vous abonner pour accéder au contenu.', {
        position: 'top-right',
        autoClose: 3000,
      });
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
      toast.error('Erreur lors de la mise à jour de la progression.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleQuizClick = (chapterIndex, quiz) => {
    if (!isSubscribed) {
      toast.warn('Vous devez vous abonner pour accéder au quiz.', {
        position: 'top-right',
        autoClose: 3000,
      });
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
      toast.warn('Vous devez vous abonner pour soumettre le quiz.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const chapterProgress = course.progress?.chapterProgress?.find(
      (cp) => cp.chapterId.toString() === course.chapters[currentContent.chapterIndex]?._id
    );
    if (chapterProgress?.quizCompleted && !quizResult) {
      toast.warn('Vous avez déjà complété ce quiz. Cliquez sur "Refaire le quiz" pour le reprendre.', {
        position: 'top-right',
        autoClose: 3000,
      });
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
      
      // Calculer les statistiques par question
      const questionResults = response.data.data.questionResults.map(result => {
        const originalQuestion = currentQuiz.questions.find(q => q._id === result.questionId);
        const totalOptions = originalQuestion?.options?.length || 0;
        const correctOptionsCount = originalQuestion?.options?.filter(opt => opt.isCorrect).length || 0;
        
        return {
          ...result,
          questionText: originalQuestion?.text || result.questionText,
          correctAnswers: originalQuestion?.options 
            ? originalQuestion.options
                .filter(opt => opt.isCorrect)
                .map((opt, idx) => ({
                  index: idx,
                  text: typeof opt === 'string' ? opt : opt.text || `Option ${idx + 1}`
                }))
            : result.correctAnswers,
          explanation: originalQuestion?.explanation || result.explanation,
          // Statistiques de la question
          statistics: {
            totalOptions: totalOptions,
            correctOptionsCount: correctOptionsCount,
            userCorrectCount: result.userAnswers.filter(userAns => 
              result.correctAnswers.some(correctAns => correctAns.index === userAns.index)
            ).length,
            percentage: correctOptionsCount > 0 
              ? Math.round((result.userAnswers.filter(userAns => 
                  result.correctAnswers.some(correctAns => correctAns.index === userAns.index)
                ).length / correctOptionsCount) * 100)
              : 0
          }
        };
      });

      setQuizResult({
        score: response.data.data.score,
        submitted: true,
        questionResults: questionResults,
        // Statistiques globales
        overallStats: {
          totalQuestions: questionResults.length,
          correctQuestions: questionResults.filter(q => q.isCorrect).length,
          averagePercentage: Math.round(questionResults.reduce((sum, q) => sum + q.statistics.percentage, 0) / questionResults.length)
        }
      });
      
      const courseResponse = await api.get(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCourse(courseResponse.data.data);
      toast.success(`Quiz soumis ! Score: ${response.data.data.score}%`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Quiz submission error:', err);
      setError('Erreur lors de la soumission du quiz');
      toast.error('Erreur lors de la soumission du quiz.', {
        position: 'top-right',
        autoClose: 3000,
      });
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
      toast.success('Abonnement réussi ! Vous pouvez maintenant accéder au contenu.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Subscription error:', err);
      setError("Erreur lors de l'abonnement au cours");
      toast.error("Erreur lors de l'abonnement au cours.", {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleAskQuestion = () => {
    if (!isSubscribed) {
      setError('Vous devez être abonné pour poser des questions');
      toast.error('Vous devez être abonné pour poser des questions.', {
        position: 'top-right',
        autoClose: 3000,
      });
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

  const navigateToNextContent = () => {
    if (!isSubscribed) return;

    const { chapterIndex, sectionIndex, type } = currentContent;
    const currentChapter = course.chapters[chapterIndex];

    if (type === 'section' && sectionIndex !== null) {
      if (sectionIndex + 1 < currentChapter.sections.length) {
        handleSectionClick(chapterIndex, sectionIndex + 1);
      } else if (currentChapter.quiz) {
        handleQuizClick(chapterIndex, currentChapter.quiz);
      } else if (chapterIndex + 1 < course.chapters.length) {
        const nextChapter = course.chapters[chapterIndex + 1];
        if (nextChapter.sections.length > 0) {
          handleSectionClick(chapterIndex + 1, 0);
        } else if (nextChapter.quiz) {
          handleQuizClick(chapterIndex + 1, nextChapter.quiz);
        }
      }
    } else if (type === 'quiz' && chapterIndex + 1 < course.chapters.length) {
      const nextChapter = course.chapters[chapterIndex + 1];
      if (nextChapter.sections.length > 0) {
        handleSectionClick(chapterIndex + 1, 0);
      } else if (nextChapter.quiz) {
        handleQuizClick(chapterIndex + 1, nextChapter.quiz);
      }
    }
  };

  const navigateToPreviousContent = () => {
    if (!isSubscribed) return;

    const { chapterIndex, sectionIndex, type } = currentContent;
    const currentChapter = course.chapters[chapterIndex];
    
    if (type === 'section' && sectionIndex > 0) {
      handleSectionClick(chapterIndex, sectionIndex - 1);
    } else if (type === 'section' && sectionIndex === 0 && chapterIndex > 0) {
      const prevChapter = course.chapters[chapterIndex - 1];
      if (prevChapter.quiz) {
        handleQuizClick(chapterIndex - 1, prevChapter.quiz);
      } else if (prevChapter.sections.length > 0) {
        handleSectionClick(chapterIndex - 1, prevChapter.sections.length - 1);
      }
    } else if (type === 'quiz' && currentChapter.sections.length > 0) {
      handleSectionClick(chapterIndex, currentChapter.sections.length - 1);
    } else if (type === 'quiz' && chapterIndex > 0) {
      const prevChapter = course.chapters[chapterIndex - 1];
      if (prevChapter.quiz) {
        handleQuizClick(chapterIndex - 1, prevChapter.quiz);
      } else if (prevChapter.sections.length > 0) {
        handleSectionClick(chapterIndex - 1, prevChapter.sections.length - 1);
      }
    }
  };

  const getYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getVideoType = (url) => {
    if (!url) return 'none';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'direct';
    return 'unknown';
  };

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

  const StudentMessagesPanel = ({ messages, onClose }) => {
    const [expandedMessages, setExpandedMessages] = useState([]);
    const [filter, setFilter] = useState('all');

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
      <ToastContainer />
      <aside className="course-sidebar">
        <button onClick={() => navigate(user?.role === 'formateur' ? '/formateur' : '/etudiant')} className="back-button">
          <FiArrowLeft className="back-icon" />
          Retour au tableau de bord
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
                      {expandedChapters.includes(chapterIndex) ? <FiChevronDown /> : <FiChevronRight />}
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
            {currentSection.videoUrl && (
              <VideoPlayer url={currentSection.videoUrl} title={currentSection.title} />
            )}
            <div 
              className="text-content" 
              dangerouslySetInnerHTML={{ __html: currentSection.content || 'Aucun contenu disponible' }}
            />
            <div className="content-navigation">
              <button
                className="nav-button prev"
                onClick={navigateToPreviousContent}
                disabled={
                  currentContent.chapterIndex === 0 && 
                  currentContent.sectionIndex === 0
                }
              >
                <FiArrowLeftNav /> Précédent
              </button>
              <button
                className="nav-button next"
                onClick={navigateToNextContent}
                disabled={
                  currentContent.chapterIndex === safeChapters.length - 1 &&
                  currentContent.sectionIndex === safeChapters[currentContent.chapterIndex].sections.length - 1 &&
                  !safeChapters[currentContent.chapterIndex].quiz
                }
              >
                Suivant <FiArrowRight />
              </button>
            </div>
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
                
                {/* AFFICHAGE DES RÉPONSES CORRECTES MÊME QUAND LE QUIZ EST DÉJÀ COMPLÉTÉ */}
                <div className="quiz-detailed-results">
                  <h5>Réponses correctes:</h5>
                  {currentQuiz.questions.map((question, index) => {
                    const correctOptions = question.options
                      .filter(opt => opt.isCorrect)
                      .map((opt, idx) => ({
                        index: idx,
                        text: typeof opt === 'string' ? opt : opt.text || `Option ${idx + 1}`
                      }));

                    return (
                      <div key={question._id || `question-${index}`} className="question-result">
                        <h6>{index + 1}. {question.text || 'Question sans texte'}</h6>
                        <p>
                          <strong>Réponse correcte :</strong>{' '}
                          {correctOptions.map(opt => opt.text).join(', ')}
                        </p>
                        <p>
                          <strong>Explication :</strong> {question.explanation || 'Aucune explication fournie.'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                
                <div className="content-navigation">
                  <button
                    className="nav-button prev"
                    onClick={navigateToPreviousContent}
                    disabled={currentContent.chapterIndex === 0 && safeChapters[currentContent.chapterIndex].sections.length === 0}
                  >
                    <FiArrowLeftNav /> Précédent
                  </button>
                  <button
                    className="nav-button next"
                    onClick={navigateToNextContent}
                    disabled={currentContent.chapterIndex === safeChapters.length - 1}
                  >
                    Suivant <FiArrowRight />
                  </button>
                </div>
              </div>
            ) : quizResult?.submitted ? (
              <div className="quiz-result">
                <h4>Résultat du quiz: {quizResult.score}%</h4>
                <p className="result-message">
                  {quizResult.score >= 70 ? '🎉 Félicitations ! Vous avez réussi le quiz.' : '📚 Continuez à apprendre, vous y êtes presque !'}
                </p>
                
                <QuizDetailedResults 
                  results={quizResult.questionResults}
                  overallStats={quizResult.overallStats}
                  onRetry={() => {
                    setQuizResult(null);
                    setQuizAnswers({});
                  }}
                />
                
                <div className="content-navigation">
                  <button
                    className="nav-button prev"
                    onClick={navigateToPreviousContent}
                    disabled={currentContent.chapterIndex === 0 && safeChapters[currentContent.chapterIndex].sections.length === 0}
                  >
                    <FiArrowLeftNav /> Précédent
                  </button>
                  <button
                    className="nav-button next"
                    onClick={navigateToNextContent}
                    disabled={currentContent.chapterIndex === safeChapters.length - 1}
                  >
                    Suivant <FiArrowRight />
                  </button>
                </div>
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
                <div className="content-navigation">
                  <button
                    type="button"
                    className="nav-button prev"
                    onClick={navigateToPreviousContent}
                    disabled={currentContent.chapterIndex === 0 && safeChapters[currentContent.chapterIndex].sections.length === 0}
                  >
                    <FiArrowLeftNav /> Précédent
                  </button>
                  <button
                    type="button"
                    className="nav-button next"
                    onClick={navigateToNextContent}
                    disabled={currentContent.chapterIndex === safeChapters.length - 1}
                  >
                    Suivant <FiArrowRight />
                  </button>
                </div>
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
          chapterId={safeChapters[currentContent.chapterIndex]?._id}
          sectionId={currentSection?._id}
          onClose={() => setShowQuestionForm(false)}
          user={user}
          onQuestionSent={() => {
            setShowQuestionForm(false);
            fetchStudentMessages();
            toast.success('Question envoyée avec succès !', {
              position: 'top-right',
              autoClose: 3000,
            });
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