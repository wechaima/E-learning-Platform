import React, { useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import CourseForm from './CourseForm';
import ConfirmationModal from './ConfirmationModal';
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
const CourseDetail = ({ course, isCreator, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = (updatedData) => {
    onUpdate(updatedData);
    setIsEditing(false);
  };

  if (!course) {
    return <div>Chargement du cours...</div>;
  }
const formatContentWithSyntaxHighlighting = (content) => {
  if (!content) return content;

  // Détecter et formater les blocs de code
  const formattedContent = content.replace(
    /```(\w+)?\s([\s\S]*?)```/g,
    (match, language, code) => {
      const lang = language || 'javascript';
      const highlightedCode = highlight(
        code.trim(),
        languages[lang] || languages.javascript,
        lang
      );
      return `<pre class="language-${lang}"><code class="language-${lang}">${highlightedCode}</code></pre>`;
    }
  );

  return formattedContent;
};
const FormattedContent = ({ content }) => {
  const formattedContent = formatContentWithSyntaxHighlighting(content);
  return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
};
  return (
    <div className="course-detail">
      {isEditing ? (
        <>
          <h2>Modifier le cours</h2>
          <CourseForm 
            initialData={course} 
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </>
      ) : (
        <>
          <div className="course-header">
            <h1>{course.title}</h1>
            {isCreator && (
              <div className="course-actions">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="edit-btn"
                >
                  <FiEdit /> Modifier
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="delete-btn"
                >
                  <FiTrash2 /> Supprimer
                </button>
              </div>
            )}
          </div>
          
          <div className="course-content">
            <p className="description">{course.description}</p>
            
            {course.imageUrl && (
              <img 
                src={course.imageUrl} 
                alt={course.title} 
                className="course-image"
              />
            )}
            
            <div className="chapters">
              <h3>Chapitres</h3>
              {course.chapters?.length > 0 ? (
                <ul>
                  {course.chapters.map((chapter, index) => (
                    <li key={chapter._id || index}>
                      <h4>{chapter.title}</h4>
                      {chapter.sections?.length > 0 && (
                        <ul>
                          {chapter.sections.map((section, secIndex) => (
                            <li key={section._id || secIndex}>{section.title}</li>
                          ))}
                        </ul>
                      )}
                      {chapter.quiz && (
                        <div className="quiz-info">
                          <p>Quiz: {chapter.quiz.questions?.length || 0} questions</p>
                          <p>Score minimum: {chapter.quiz.passingScore}%</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucun chapitre disponible</p>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        message="Êtes-vous sûr de vouloir supprimer ce cours ?"
        onConfirm={() => {
          onDelete();
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default CourseDetail;