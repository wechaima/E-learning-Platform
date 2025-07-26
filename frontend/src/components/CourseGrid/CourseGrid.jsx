import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaUserTie, FaUsers } from 'react-icons/fa';
import './CourseGrid.css';

const CourseGrid = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token'); // Simple auth check; adjust based on your auth setup

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses', {
          params: {
            populate: 'createdBy',
            page,
            limit: 9, // 3 courses per row x 3 rows per page
          },
        });
        
        console.log('Données reçues:', response.data);
        
        const newCourses = response.data.data || response.data || [];
        setCourses((prev) => (page === 1 ? newCourses : [...prev, ...newCourses]));
        setHasMore(newCourses.length === 9); // Assume more if full page is returned
      } catch (err) {
        setError('Erreur lors du chargement des cours');
        console.error('Erreur:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [page]);

  const handleCourseClick = (courseId) => {
    if (isAuthenticated) {
      navigate(`/courses/${courseId}`);
    } else {
      navigate('/login');
    }
  };

  const handleSubscribeClick = (courseId) => {
    if (isAuthenticated) {
      // Implement subscribe logic (e.g., API call to followCourse)
      console.log(`S'abonner au cours ${courseId}`);
      // Example API call: await api.post(`/courses/${courseId}/follow`);
    } else {
      navigate('/login');
    }
  };

  const loadMoreCourses = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && page === 1) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="course-grid-container">
      
        <h1 className="course-grid-title"> Nos formations populaires <p>Découvrez nos cours les plus appréciés</p></h1>
          
        <div className="course-grid">
          {courses.map((course) => (
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
                <p className="description">
                  {course.description?.substring(0, 100)}
                  {course.description?.length > 100 ? '...' : ''}
                </p>
                
                <div className="instructor-info">
                  <FaUserTie className="instructor-icon" />
                  <span>
                    {course.createdBy?.prenom} {course.createdBy?.nom}
                  </span>
                </div>
                
                <button
                  onClick={() => handleSubscribeClick(course._id)}
                  className="subscribe-button"
                >
                  S'abonner
                </button>
                <button
                  onClick={() => handleCourseClick(course._id)}
                  className="view-button"
                >
                  Voir le détail
                </button>
              </div>
            </div>
          ))}
        </div>
     
      {hasMore && (
        <div className="load-more">
          <button onClick={loadMoreCourses} disabled={loading} className="load-more-button">
            {loading ? 'Chargement...' : 'Plus de cours'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseGrid;