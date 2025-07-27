import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import ChapterManager from '../../components/formateurs/ChapterManager';
import AddChapterModal from '../../components/formateurs/AddChapterModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/courses/${courseId}`);
        setCourse(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleAddChapter = async (chapterData) => {
    try {
      const response = await axios.post(`/courses/${courseId}/chapters`, chapterData);
      setCourse({
        ...course,
        chapters: [...course.chapters, response.data.data]
      });
      setShowAddChapterModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateChapter = async (chapterId, updatedData) => {
    try {
      await axios.put(`/courses/${courseId}/chapters/${chapterId}`, updatedData);
      setCourse({
        ...course,
        chapters: course.chapters.map(chap => 
          chap._id === chapterId ? { ...chap, ...updatedData } : chap
        )
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      await axios.delete(`/courses/${courseId}/chapters/${chapterId}`);
      setCourse({
        ...course,
        chapters: course.chapters.filter(chap => chap._id !== chapterId)
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return <div>Cours non trouvé</div>;

  return (
    <div className="course-detail">
      <div className="course-header">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <button onClick={() => setShowAddChapterModal(true)}>
          + Ajouter un chapitre
        </button>
      </div>

      <div className="chapters-list">
        {course.chapters?.map(chapter => (
          <ChapterManager
            key={chapter._id}
            chapter={chapter}
            onAddSection={async (chapterId, sectionData) => {
              const response = await axios.post(
                `/courses/${courseId}/chapters/${chapterId}/sections`, 
                sectionData
              );
              // Mettre à jour l'état local...
            }}
            onEditChapter={handleUpdateChapter}
            onDeleteChapter={handleDeleteChapter}
            onEditSection={async (chapterId, sectionId, updatedData) => {
              await axios.put(
                `/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}`,
                updatedData
              );
              // Mettre à jour l'état local...
            }}
            onDeleteSection={async (chapterId, sectionId) => {
              await axios.delete(
                `/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}`
              );
              // Mettre à jour l'état local...
            }}
          />
        ))}
      </div>

      <AddChapterModal
        isOpen={showAddChapterModal}
        onClose={() => setShowAddChapterModal(false)}
        onSubmit={handleAddChapter}
      />
    </div>
  );
};

export default CourseDetail;