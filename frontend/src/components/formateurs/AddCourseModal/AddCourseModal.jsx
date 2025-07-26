import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { XIcon } from '@heroicons/react/outline'; // Updated to v1

import './AddCourseModal.css';
import Modal from '../ui/Modal';


const AddCourseModal = ({ isOpen, onClose, onSubmit }) => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(courseData);
    setCourseData({ title: '', description: '', imageUrl: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un cours">
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre du cours *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={courseData.title}
            onChange={handleChange}
            required
            placeholder="Titre du cours"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={courseData.description}
            onChange={handleChange}
            placeholder="Description du cours"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            rows={4}
          />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
            URL de l’image
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={courseData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
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
            Créer le cours
          </button>
        </div>
      </form>
    </Modal>
  );
};

AddCourseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddCourseModal;