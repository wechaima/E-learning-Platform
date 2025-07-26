import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`bg-red-50 text-red-700 p-4 rounded-lg ${className}`}>
      <div className="flex justify-between items-center">
        <p>{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="ml-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
  className: PropTypes.string
};

export default ErrorMessage;