import React, { useState } from 'react';
import { FiSend, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import './QuestionForm.css';

const QuestionForm = ({ courseId, chapterId, sectionId, onClose, user }) => {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError('Veuillez saisir votre question');
      return;
    }

    if (!courseId || !user?.token) {
      setError('Données du cours ou utilisateur manquantes');
      return;
    }

    setIsSubmitting(true);
    setError('');

   try {
  const response = await api.post(
    '/messages',
    {
      courseId,
      chapterId: chapterId || null,
      sectionId: sectionId || null,
      question: question.trim(),
      email: user?.email,   // 👈 on envoie aussi l’email de l’utilisateur
    },
    {
      headers: { Authorization: `Bearer ${user.token}` },
    }
  );

  setSuccess('Votre question a été envoyée au formateur');
  setQuestion('');
  setTimeout(() => {
    onClose();
  }, 1500);
} catch (err) {
  console.error('Error sending question:', {
    message: err.message,
    response: err.response?.data,
    status: err.response?.status,
  });
  setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la question');
}
 finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="question-form-overlay">
      <div className="question-form-container">
        <div className="question-form-header">
          <h3>Poser une question au formateur</h3>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          <div className="form-group">
            <label>Votre question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Écrivez votre question ici..."
              rows="5"
              disabled={isSubmitting}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={isSubmitting}>
              Annuler
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !question.trim()}
            >
              {isSubmitting ? 'Envoi...' : (
                <>
                  <FiSend /> Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;