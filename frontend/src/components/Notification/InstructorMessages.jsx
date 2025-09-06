import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiCheck, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../../api/axios';
import './InstructorMessages.css';

const InstructorMessages = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'unanswered'

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/messages/instructor' 
        : `/messages/instructor?filter=${filter}`;
      
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setMessages(response.data.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
    setResponse(message.response || '');
    
    // Marquer comme lu si ce n'est pas déjà fait
    if (!message.isRead) {
      markAsRead(message._id);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.patch(`/messages/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setMessages(messages.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true } : msg
      ));
      
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    
    if (!response.trim()) {
      return;
    }
    
    setResponding(true);
    
    try {
      const res = await api.post(`/messages/${selectedMessage._id}/respond`, {
        response: response.trim()
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const updatedMessage = res.data.data;
      
      setMessages(messages.map(msg => 
        msg._id === updatedMessage._id ? updatedMessage : msg
      ));
      
      setSelectedMessage(updatedMessage);
      setResponse('');
    } catch (err) {
      console.error('Error submitting response:', err);
    } finally {
      setResponding(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Chargement des messages...</div>;
  }

  return (
    <div className="instructor-messages-container">
      <div className="messages-header">
        <h2>
          <FiMessageSquare /> Messages des étudiants
        </h2>
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button 
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}
          >
            Non lus
          </button>
          <button 
            className={filter === 'unanswered' ? 'active' : ''}
            onClick={() => setFilter('unanswered')}
          >
            Sans réponse
          </button>
        </div>
      </div>

      <div className="messages-content">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-messages">
              Aucun message {filter !== 'all' ? ` ${filter}` : ''}
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message._id}
                className={`message-item ${selectedMessage?._id === message._id ? 'selected' : ''} ${!message.isRead ? 'unread' : ''}`}
                onClick={() => handleMessageSelect(message)}
              >
                <div className="message-preview">
                  <h4>{message.student.prenom} {message.student.nom}</h4>
                  <p className="course-name">{message.course.title}</p>
                  <p className="question-preview">{message.question}</p>
                </div>
                <div className="message-meta">
                  <span className="date">{formatDate(message.createdAt)}</span>
                  <div className="message-status">
                    {message.response ? (
                      <FiCheckCircle className="responded" title="Répondu" />
                    ) : (
                      <FiClock className="pending" title="En attente" />
                    )}
                    {!message.isRead && <span className="unread-dot"></span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="message-detail">
          {selectedMessage ? (
            <div className="message-view">
              <div className="message-header">
                <div>
                  <h3>
                    {selectedMessage.student.prenom} {selectedMessage.student.nom}
                  </h3>
                  <p className="course-info">
                    Cours: {selectedMessage.course.title}
                  </p>
                  {selectedMessage.chapter && (
                    <p className="chapter-info">
                      Chapitre: {selectedMessage.chapter.title}
                    </p>
                  )}
                  <p className="message-date">
                    Reçu le: {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>
              </div>

              <div className="question-content">
                <h4>Question de l'étudiant:</h4>
                <p>{selectedMessage.question}</p>
              </div>

              {selectedMessage.response ? (
                <div className="response-content">
                  <h4>Votre réponse:</h4>
                  <p>{selectedMessage.response}</p>
                  <p className="response-date">
                    Répondu le: {formatDate(selectedMessage.respondedAt)}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResponseSubmit} className="response-form">
                  <div className="form-group">
                    <label>Votre réponse</label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Écrivez votre réponse ici..."
                      rows="5"
                      disabled={responding}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="submit-response-btn"
                    disabled={responding || !response.trim()}
                  >
                    {responding ? 'Envoi...' : (
                      <>
                        <FiCheck /> Envoyer la réponse
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="no-message-selected">
              <FiMessageSquare />
              <p>Sélectionnez un message pour afficher son contenu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorMessages;