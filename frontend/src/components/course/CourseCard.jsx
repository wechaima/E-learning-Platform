import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course, isFormateur, onClick }) => {
  return (
    <div className="course-card" onClick={onClick}>
      <div className="course-image">
        {course.imageUrl ? (
          <img src={course.imageUrl} alt={course.title} />
        ) : (
          <div className="default-image">{course.title.charAt(0)}</div>
        )}
        {isFormateur && (
          <div className="course-actions">
            <Link 
              to={`/formateur/courses/edit/${course._id}`} 
              className="edit-btn"
              onClick={(e) => e.stopPropagation()}
            >
              Modifier
            </Link>
          </div>
        )}
      </div>
      <div className="course-content">
        <h3>{course.title}</h3>
        <p className="description">{course.description.substring(0, 100)}...</p>
        <div className="course-meta">
          <span className="category">{course.category}</span>
          <span className="students">{course.students || 0} étudiants</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;