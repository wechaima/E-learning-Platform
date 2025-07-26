import React from 'react';
import PropTypes from 'prop-types';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline'; // Updated to v1
import './CourseCard.css';

const CourseCard = ({ course, onCourseClick, onUpdateCourse, onDeleteCourse, isFormateur }) => {
  const handleEdit = () => {
    const newTitle = prompt('Nouveau titre du cours:', course.title);
    if (newTitle) {
      onUpdateCourse(course._id, { title: newTitle });
    }
  };

  return (
    <div className="course-card" onClick={() => onCourseClick(course._id)}>
      <img
        src={course.imageUrl || '/default-course.jpg'}
        alt={course.title}
        className="course-image"
        onError={(e) => (e.target.src = '/default-course.jpg')}
      />
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      {isFormateur && (
        <div className="course-actions">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(); }} className="action-button edit">
            <PencilIcon className="w-5 h-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDeleteCourse(course._id); }} className="action-button delete">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
  }).isRequired,
  onCourseClick: PropTypes.func.isRequired,
  onUpdateCourse: PropTypes.func.isRequired,
  onDeleteCourse: PropTypes.func.isRequired,
  isFormateur: PropTypes.bool.isRequired,
};

export default CourseCard;