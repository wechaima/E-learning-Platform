import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CourseCard.css';

const CourseCard = ({ course, onDelete }) => {
  return (
    <div className="course-card">
      <div className="course-image">
        <img src={course.imageUrl || '/default-course.jpg'} alt={course.title} />
      </div>
      <div className="course-content">
        <h3>{course.title}</h3>
        <p className="description">{course.description.substring(0, 100)}...</p>
        <div className="course-meta">
          <span className="category">{course.category}</span>
          <span className="students">{course.followers?.length || 0} apprenants</span>
        </div>
      </div>
      <div className="course-actions">
        <Link to={`/courses/${course._id}`} className="btn btn-primary">
          Voir détails
        </Link>
        <Link 
          to={`/courses/${course._id}/edit`} 
          className="btn btn-secondary"
        >
          Modifier
        </Link>
        <button 
          onClick={() => onDelete(course._id)} 
          className="btn btn-danger"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default CourseCard;