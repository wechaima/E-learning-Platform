import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FaStar, FaRegStar, FaUsers, FaClock } from 'react-icons/fa';
import './CourseGrid.css';

const CourseGrid = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      const coursesData = Array.isArray(res.data?.data || res.data) 
        ? (res.data?.data || res.data) 
        : [];
      setCourses(coursesData);
    } catch (err) {
      setError("Failed to fetch courses. Please try again later.");
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="star half-filled" />);
      } else {
        stars.push(<FaRegStar key={i} className="star" />);
      }
    }
    
    return stars;
  };

  return (
    <section className="course-grid-section">
      <div className="container">
        <div className="section-header">
          <h2>Nos formations populaires</h2>
          <p>Découvrez nos cours les plus appréciés par nos étudiants</p>
        </div>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : courses.length > 0 ? (
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course._id} className="course-card">
                <div className="course-image">
                  <img src={course.imageUrl || 'https://via.placeholder.com/300x200'} alt={course.title} />
                  <div className="course-badge">Populaire</div>
                </div>
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-instructor">Par {course.instructor || 'Anonyme'}</p>
                  
                  <div className="course-meta">
                    <div className="course-rating">
                      {renderRating(course.rating || 4.5)}
                      <span>{course.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                    <div className="course-stats">
                      <span><FaUsers /> {course.enrollments || 0}</span>
                      <span><FaClock /> {course.duration || '10h'}</span>
                    </div>
                  </div>
                  
                  <div className="course-price">
                    {course.discountPrice ? (
                      <>
                        <span className="original-price">${course.price}</span>
                        <span className="discount-price">${course.discountPrice}</span>
                      </>
                    ) : (
                      <span>${course.price || 'Gratuit'}</span>
                    )}
                  </div>
                  
                  <button className="enroll-button">S'inscrire</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courses">Aucun cours disponible pour le moment</div>
        )}
        
        <div className="view-all-container">
          <button className="view-all-button">Voir toutes les formations</button>
        </div>
      </div>
    </section>
  );
};

export default CourseGrid;