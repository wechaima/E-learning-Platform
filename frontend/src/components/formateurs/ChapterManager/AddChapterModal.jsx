import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { XIcon } from '@heroicons/react/outline'; // Use XIcon from v1

import './AddChapterModal.css';
import Modal from '../ui/Modal';

const AddChapterModal = ({ isOpen, onClose, onSubmit }) => {
  const [chapterData, setChapterData] = useState({
    title: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChapterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(chapterData);
    setChapterData({ title: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un chapitre">
      <form onSubmit={handleSubmit} className="chapter-form">
        <div className="form-group">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre du chapitre *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={chapterData.title}
            onChange={handleChange}
            required
            placeholder="Introduction au cours"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="form-actions mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Créer le chapitre
          </button>
        </div>
      </form>
    </Modal>
  );
};

AddChapterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddChapterModal;