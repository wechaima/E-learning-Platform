import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-modal-content">
          <p>{message}</p>
        </div>
        <div className="confirmation-modal-actions">
          <button onClick={onCancel} className="cancel-btn">
            Annuler
          </button>
          <button onClick={onConfirm} className="confirm-btn">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;