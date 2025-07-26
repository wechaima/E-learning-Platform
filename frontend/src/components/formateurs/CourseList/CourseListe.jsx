import React from 'react';
import PropTypes from 'prop-types';
import CourseCard from '../CourseCard/CourseCard';
import './CourseList.css';

const CourseList = ({ courses, onCourseClick, onUpdateCourse, onDeleteCourse, isFormateur }) => {
  return (
    <div className="course-list">
      {courses.map((course) => (
        <CourseCard
          key={course._id}
          course={course}
          onCourseClick={onCourseClick}
          onUpdateCourse={onUpdateCourse}
          onDeleteCourse={onDeleteCourse}
          isFormateur={isFormateur}
        />
      ))}
    </div>
  );
};

CourseList.propTypes = {
  courses: PropTypes.array.isRequired,
  onCourseClick: PropTypes.func.isRequired,
  onUpdateCourse: PropTypes.func.isRequired,
  onDeleteCourse: PropTypes.func.isRequired,
  isFormateur: PropTypes.bool.isRequired,
};

export default CourseList;