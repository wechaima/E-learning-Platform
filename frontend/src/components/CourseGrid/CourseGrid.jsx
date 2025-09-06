import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaUserTie, FaUsers } from 'react-icons/fa';
import './CourseGrid.css';

const CourseGrid = () => {
  const [courses, setCourses] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses', {
          params: {
            populate: 'createdBy',
          },
        });

        const data = response.data.data || response.data || [];
        setCourses(data);
      } catch (err) {
        setError('Erreur lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(isAuthenticated ? `/courses/${courseId}` : '/login');
  };

  const handleSubscribeClick = (courseId) => {
    if (!isAuthenticated) return navigate('/login');
    console.log(`S'abonner au cours ${courseId}`);
  };

  const loadMoreCourses = () => {
    setVisibleCount((prev) => prev + 3);
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="course-grid-container">
      <h1 className="course-grid-title">
        Nos formations populaires <p>Découvrez nos cours les plus appréciés</p>
      </h1>

      <div className="course-grid">
        {courses.slice(0, visibleCount).map((course) => (
          <div key={course._id} className="course-card">
            <div className="course-image-container">
              <img
                src={course.imageUrl || '/default-course.jpg'}
                alt={course.title}
                className="course-image"
              />
              <div className="followers-count">
                <FaUsers /> {course.followerCount || 0}
              </div>
            </div>

            <div className="course-details">
              <h3>{course.title}</h3>
              <div className="description">
                {course.description
                  ? new DOMParser()
                      .parseFromString(course.description, 'text/html')
                      .body.textContent.substring(0, 100) + (course.description.length > 100 ? '...' : '')
                  : ''}
              </div>

              <div className="instructor-info">
                <FaUserTie className="instructor-icon" />
                <span>
                  {course.createdBy?.prenom} {course.createdBy?.nom}
                </span>
              </div>

              <button onClick={() => handleSubscribeClick(course._id)} className="subscribe-button">
                S'abonner
              </button>
              <button onClick={() => handleCourseClick(course._id)} className="view-button">
                Voir le détail
              </button>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < courses.length && (
        <div className="load-more">
          <button onClick={loadMoreCourses} className="load-more-button">
            Plus de cours
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseGrid;