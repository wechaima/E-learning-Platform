import React from 'react';
import PropTypes from 'prop-types';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline'; // Updated to v1
import './SectionItem.css';

const SectionItem = ({ section, onEdit, onDelete }) => {
  return (
    <div className="section-item">
      <div className="section-content">
        <h4>{section.title}</h4>
        {section.content && <p>{section.content}</p>}
        {section.videoUrl && (
          <a href={section.videoUrl} target="_blank" rel="noopener noreferrer">
            Vidéo
          </a>
        )}
      </div>
      <div className="section-actions">
        <button onClick={onEdit} className="action-button edit">
          <PencilIcon className="w-5 h-5" />
        </button>
        <button onClick={onDelete} className="action-button delete">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

SectionItem.propTypes = {
  section: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    videoUrl: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SectionItem;