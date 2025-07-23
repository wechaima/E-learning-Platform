import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaStar, FaRegStar, FaUsers, FaClock } from 'react-icons/fa';
import './CourseGrid.css';

const CourseGrid = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses?populate=createdBy');
      const coursesData = Array.isArray(res.data?.data || res.data) 
        ? (res.data?.data || res.data) 
        : [];
      setCourses(coursesData);
    } catch (err) {
      setError("Échec du chargement des cours. Veuillez réessayer.");
      console.error("Échec du chargement des cours:", err);
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

  const handleEnrollClick = () => {
    navigate('/login');
  };

  return (
    <section className="course-grid-section">
      <div className="container">
        <div className="section-header">
          <h2>Nos formations populaires</h2>
          <p>Découvrez nos cours les plus appréciés</p>
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
                {/* Image du cours */}
                <div className="course-image">
                  <img 
                    src={course.imageUrl || '/images/course-default.jpg'} 
                    alt={course.title} 
                    onError={(e) => {
                      e.target.src = '/images/course-default.jpg';
                    }}
                  />
                </div>
                
                <div className="course-content">
                  {/* Titre du cours */}
                  <h3 className="course-title">{course.title}</h3>
                  
                  {/* Description du cours (tronquée) */}
                  <p className="course-description">
                    {course.description?.length > 100 
                      ? `${course.description.substring(0, 100)}...` 
                      : course.description}
                  </p>
                  
                  {/* Nom du formateur */}
                  <div className="course-instructor">
                    <span>Formateur : </span>
                    {course.createdBy?.prenom 
                      ? `${course.createdBy.prenom} ${course.createdBy.nom}`
                      : 'Non spécifié'}
                  </div>
                  
                  {/* Métadonnées */}
                  <div className="course-meta">
                    <div className="course-rating">
                      {renderRating(course.rating || 0)}
                      <span>({course.rating?.toFixed(1) || '0.0'})</span>
                    </div>
                    <div className="course-stats">
                      <span><FaUsers /> {course.enrollments || 0}</span>
                      <span><FaClock /> {course.duration || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Bouton d'inscription */}
                  <button 
                    className="enroll-button"
                    onClick={handleEnrollClick}
                  >
                    S'inscrire
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courses">Aucun cours disponible actuellement</div>
        )}
      </div>
    </section>
  );
};

export default CourseGrid;