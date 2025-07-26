import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline'; // Updated to v1

import SectionItem from './SectionItem';
import './ChapterManager.css';
import Modal from '../ui/Modal';

const ChapterManager = ({
  chapter,
  onAddSection,
  onEditChapter,
  onDeleteChapter,
  onEditSection,
  onDeleteSection,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionData, setNewSectionData] = useState({
    title: '',
    content: '',
    videoUrl: '',
  });

  const handleAddSection = () => {
    if (newSectionData.title.trim()) {
      onAddSection(chapter._id, {
        ...newSectionData,
        order: chapter.sections ? chapter.sections.length + 1 : 1,
      });
      setNewSectionData({ title: '', content: '', videoUrl: '' });
      setShowAddSectionModal(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSectionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="chapter-container">
      <div
        className="chapter-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="chapter-title">
          <h3>{chapter.title}</h3>
        </div>
        <div className="chapter-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditChapter(chapter._id);
            }}
            className="action-button edit"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChapter(chapter._id);
            }}
            className="action-button delete"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAddSectionModal(true);
            }}
            className="add-section-button"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Section</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="chapter-content">
          {chapter.sections && chapter.sections.length > 0 ? (
            <div className="sections-list">
              {chapter.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <SectionItem
                    key={section._id}
                    section={section}
                    onEdit={() => onEditSection(chapter._id, section._id)}
                    onDelete={() => onDeleteSection(chapter._id, section._id)}
                  />
                ))}
            </div>
          ) : (
            <p className="no-sections">Aucune section dans ce chapitre</p>
          )}
        </div>
      )}

      <Modal
        isOpen={showAddSectionModal}
        onClose={() => setShowAddSectionModal(false)}
        title="Ajouter une section"
      >
        <div className="add-section-form">
          <div className="form-group">
            <label htmlFor="title">Titre de la section *</label>
            <input
              type="text"
              name="title"
              value={newSectionData.title}
              onChange={handleInputChange}
              placeholder="Titre de la section"
              className="section-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">Contenu (optionnel)</label>
            <textarea
              name="content"
              value={newSectionData.content}
              onChange={handleInputChange}
              placeholder="Contenu de la section"
              className="section-input"
              rows={4}
            />
          </div>
          <div className="form-group">
            <label htmlFor="videoUrl">URL de la vidéo (optionnel)</label>
            <input
              type="url"
              name="videoUrl"
              value={newSectionData.videoUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/video"
              className="section-input"
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowAddSectionModal(false)}
              className="cancel-button"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleAddSection}
              className="submit-button"
            >
              Ajouter
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

ChapterManager.propTypes = {
  chapter: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    sections: PropTypes.array,
  }).isRequired,
  onAddSection: PropTypes.func.isRequired,
  onEditChapter: PropTypes.func.isRequired,
  onDeleteChapter: PropTypes.func.isRequired,
  onEditSection: PropTypes.func.isRequired,
  onDeleteSection: PropTypes.func.isRequired,
};

export default ChapterManager;