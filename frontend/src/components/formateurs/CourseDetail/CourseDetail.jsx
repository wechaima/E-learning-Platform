import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/outline'; // Updated to v1
import AddChapterModal from '../AddChapterModal/AddChapterModal';
import ChapterManager from '../ChapterManager/ChapterManager';
import './CourseDetails.css';

const CourseDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setCourse(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement du cours');
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handleAddChapter = async (chapterData) => {
    try {
      const response = await axios.post(
        `/api/courses/${id}/chapters`,
        {
          ...chapterData,
          courseId: id,
          order: course.chapters.length + 1,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setCourse({
        ...course,
        chapters: [...course.chapters, response.data.data],
      });
      setShowAddChapterModal(false);
    } catch (err) {
      setError('Erreur lors de l’ajout du chapitre');
    }
  };

  const handleEditChapter = async (chapterId) => {
    const newTitle = prompt('Nouveau titre du chapitre:');
    if (newTitle) {
      try {
        const response = await axios.put(
          `/api/courses/${id}/chapters/${chapterId}`,
          { title: newTitle },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setCourse({
          ...course,
          chapters: course.chapters.map((ch) =>
            ch._id === chapterId ? { ...ch, title: response.data.data.title } : ch
          ),
        });
      } catch (err) {
        setError('Erreur lors de la modification du chapitre');
      }
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce chapitre ?')) {
      try {
        await axios.delete(`/api/courses/${id}/chapters/${chapterId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setCourse({
          ...course,
          chapters: course.chapters.filter((ch) => ch._id !== chapterId),
        });
      } catch (err) {
        setError('Erreur lors de la suppression du chapitre');
      }
    }
  };

  const handleAddSection = async (chapterId, sectionData) => {
    try {
      const response = await axios.post(
        `/api/courses/${id}/chapters/${chapterId}/sections`,
        sectionData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setCourse({
        ...course,
        chapters: course.chapters.map((ch) =>
          ch._id === chapterId
            ? { ...ch, sections: [...(ch.sections || []), response.data.data] }
            : ch
        ),
      });
    } catch (err) {
      setError('Erreur lors de l’ajout de la section');
    }
  };

  const handleEditSection = async (chapterId, sectionId) => {
    const newTitle = prompt('Nouveau titre de la section:');
    if (newTitle) {
      try {
        const response = await axios.put(
          `/api/courses/${id}/chapters/${chapterId}/sections/${sectionId}`,
          { title: newTitle },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setCourse({
          ...course,
          chapters: course.chapters.map((ch) =>
            ch._id === chapterId
              ? {
                  ...ch,
                  sections: ch.sections.map((sec) =>
                    sec._id === sectionId ? { ...sec, title: response.data.data.title } : sec
                  ),
                }
              : ch
          ),
        });
      } catch (err) {
        setError('Erreur lors de la modification de la section');
      }
    }
  };

  const handleDeleteSection = async (chapterId, sectionId) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette section ?')) {
      try {
        await axios.delete(`/api/courses/${id}/chapters/${chapterId}/sections/${sectionId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setCourse({
          ...course,
          chapters: course.chapters.map((ch) =>
            ch._id === chapterId
              ? { ...ch, sections: ch.sections.filter((sec) => sec._id !== sectionId) }
              : ch
          ),
        });
      } catch (err) {
        setError('Erreur lors de la suppression de la section');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!course) {
    return <div className="error-message">Cours non trouvé</div>;
  }

  return (
    <div className="course-details">
      <header className="course-details-header">
        <button
          className="back-button"
          onClick={() => navigate('/formateur')}
        >
          <ArrowLeftIcon className="w-6 h-6" />
          Retour
        </button>
        <h1>{course.title}</h1>
        <button
          className="add-chapter-button"
          onClick={() => setShowAddChapterModal(true)}
        >
          <PlusIcon className="w-5 h-5" />
          Ajouter un chapitre
        </button>
      </header>

      <main className="course-details-content">
        <div className="course-info">
          <p>{course.description}</p>
          <img
            src={course.imageUrl || '/default-course.jpg'}
            alt={course.title}
            className="course-image"
            onError={(e) => (e.target.src = '/default-course.jpg')}
          />
        </div>

        <div className="chapters-list">
          <h2>Chapitres ({course.chapters.length})</h2>
          {course.chapters.length > 0 ? (
            course.chapters
              .sort((a, b) => a.order - b.order)
              .map((chapter) => (
                <ChapterManager
                  key={chapter._id}
                  chapter={chapter}
                  onAddSection={handleAddSection}
                  onEditChapter={handleEditChapter}
                  onDeleteChapter={handleDeleteChapter}
                  onEditSection={handleEditSection}
                  onDeleteSection={handleDeleteSection}
                />
              ))
          ) : (
            <p>Aucun chapitre disponible. Ajoutez un chapitre pour commencer.</p>
          )}
        </div>
      </main>

      <AddChapterModal
        isOpen={showAddChapterModal}
        onClose={() => setShowAddChapterModal(false)}
        onSubmit={handleAddChapter}
      />
    </div>
  );
};

export default CourseDetails;