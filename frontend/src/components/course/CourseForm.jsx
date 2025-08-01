import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

function CourseForm({ onSubmit, onCancel, initialData }) {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    chapters: []
  });

  const [expandedChapter, setExpandedChapter] = useState(null);

  // Initialize form with initialData when editing
  useEffect(() => {
    if (initialData) {
      const formattedData = {
        title: initialData.title || '',
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        category: initialData.category || '',
        chapters: initialData.chapters?.map((chapter, index) => ({
          _id: chapter._id || undefined,
          title: chapter.title || '',
          order: chapter.order || index + 1,
          sections: chapter.sections?.map((section, secIndex) => ({
            title: section.title || '',
            content: section.content || '',
            videoUrl: section.videoUrl || '',
            order: section.order || secIndex + 1
          })) || [],
          quiz: {
            passingScore: chapter.quiz?.passingScore || 70,
            questions: chapter.quiz?.questions?.map((q, qIndex) => ({
              text: q.text || '',
              options: q.options?.map(opt => opt.text) || ['', '', '', ''],
              correctOption: q.options?.findIndex(opt => opt.isCorrect) || 0,
              explanation: q.explanation || ''
            })) || []
          }
        })) || []
      };
      setCourseData(formattedData);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value
    });
  };

  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[index][field] = value;
    setCourseData({
      ...courseData,
      chapters: updatedChapters
    });
  };

  const handleSectionChange = (chapterIndex, sectionIndex, field, value) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].sections[sectionIndex][field] = value;
    setCourseData({
      ...courseData,
      chapters: updatedChapters
    });
  };

  const handleQuizQuestionChange = (chapterIndex, questionIndex, field, value) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].quiz.questions[questionIndex][field] = value;
    setCourseData({
      ...courseData,
      chapters: updatedChapters
    });
  };

  const addChapter = () => {
    setCourseData({
      ...courseData,
      chapters: [
        ...courseData.chapters,
        {
          title: '',
          order: courseData.chapters.length + 1,
          sections: [],
          quiz: {
            passingScore: 70,
            questions: []
          }
        }
      ]
    });
  };

  const removeChapter = (index) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters.splice(index, 1);
    setCourseData({
      ...courseData,
      chapters: updatedChapters
    });
  };

  const addSection = (chapterIndex) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].sections.push({
      title: '',
      content: '',
      videoUrl: '',
      order: updatedChapters[chapterIndex].sections.length + 1
    });
    setCourseData({
      ...courseData,
      chapters: updatedChapters
    });
  };

  const removeSection = (chapterIndex, sectionIndex) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].sections.splice(sectionIndex, 1);
    setCourseData({
      ...courseData,
      chapters: updatedChapters
    });
  };

  const addQuizQuestion = (chapterIndex) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].quiz.questions.push({
      text: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: ''
    });
    setCourseData({
      ...courseData,
      chapters: updatedChapters
    });
  };

  const removeQuizQuestion = (chapterIndex, questionIndex) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].quiz.questions.splice(questionIndex, 1);
    setCourseData({
      ...courseData,
      chapters: updatedChapters
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedData = {
      ...courseData,
      chapters: courseData.chapters.map((chapter, index) => ({
        _id: chapter._id || undefined,
        title: chapter.title,
        order: chapter.order || index + 1,
        sections: chapter.sections.map((section, secIndex) => ({
          title: section.title,
          content: section.content,
          videoUrl: section.videoUrl,
          order: section.order || secIndex + 1
        })),
        quiz: {
          passingScore: chapter.quiz.passingScore,
          questions: chapter.quiz.questions.map((q) => ({
            text: q.text,
            explanation: q.explanation,
            options: q.options.map((opt, idx) => ({
              text: opt,
              isCorrect: idx === q.correctOption
            }))
          }))
        }
      }))
    };

    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit} className="course-form">
      <div className="form-group">
        <label>Titre du cours*</label>
        <input
          type="text"
          name="title"
          value={courseData.title}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description*</label>
        <textarea
          name="description"
          value={courseData.description}
          onChange={handleInputChange}
          required
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>URL de l'image</label>
        <input
          type="text"
          name="imageUrl"
          value={courseData.imageUrl}
          onChange={handleInputChange}
          placeholder="Laisser vide pour utiliser l'image par défaut"
        />
      </div>

      <div className="form-group">
        <label>Catégorie*</label>
        <input
          type="text"
          name="category"
          value={courseData.category}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="chapters-section">
        <div className="section-header">
          <h3>Chapitres</h3>
          <button type="button" onClick={addChapter} className="add-btn">
            <FiPlus /> Ajouter un chapitre
          </button>
        </div>

        {courseData.chapters.map((chapter, chapterIndex) => (
          <div key={chapterIndex} className="chapter-card">
            <div className="chapter-header">
              <div className="chapter-title">
                <span>Chapitre {chapterIndex + 1}</span>
                <input
                  type="text"
                  value={chapter.title}
                  onChange={(e) => handleChapterChange(chapterIndex, 'title', e.target.value)}
                  placeholder="Titre du chapitre"
                  required
                />
              </div>
              <div className="chapter-actions">
                <button
                  type="button"
                  onClick={() => setExpandedChapter(expandedChapter === chapterIndex ? null : chapterIndex)}
                  className="toggle-btn"
                >
                  {expandedChapter === chapterIndex ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                <button
                  type="button"
                  onClick={() => removeChapter(chapterIndex)}
                  className="remove-btn"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            {expandedChapter === chapterIndex && (
              <div className="chapter-content">
                <div className="sections-container">
                  <h4>Sections</h4>
                  <button
                    type="button"
                    onClick={() => addSection(chapterIndex)}
                    className="add-btn small"
                  >
                    <FiPlus /> Ajouter une section
                  </button>

                  {chapter.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="section-card">
                      <div className="section-header">
                        <span>Section {sectionIndex + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeSection(chapterIndex, sectionIndex)}
                          className="remove-btn small"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                      <div className="form-group">
                        <label>Titre</label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleSectionChange(chapterIndex, sectionIndex, 'title', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Contenu</label>
                        <textarea
                          value={section.content}
                          onChange={(e) => handleSectionChange(chapterIndex, sectionIndex, 'content', e.target.value)}
                          rows="3"
                        />
                      </div>
                      <div className="form-group">
                        <label>URL de la vidéo</label>
                        <input
                          type="text"
                          value={section.videoUrl}
                          onChange={(e) => handleSectionChange(chapterIndex, sectionIndex, 'videoUrl', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="quiz-container">
                  <h4>Quiz</h4>
                  <div className="form-group">
                    <label>Score de passage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={chapter.quiz.passingScore}
                      onChange={(e) => handleChapterChange(chapterIndex, 'quiz', {
                        ...chapter.quiz,
                        passingScore: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => addQuizQuestion(chapterIndex)}
                    className="add-btn small"
                  >
                    <FiPlus /> Ajouter une question
                  </button>

                  {chapter.quiz.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="question-card">
                      <div className="question-header">
                        <span>Question {questionIndex + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeQuizQuestion(chapterIndex, questionIndex)}
                          className="remove-btn small"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                      <div className="form-group">
                        <label>Question*</label>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => handleQuizQuestionChange(chapterIndex, questionIndex, 'text', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Options*</label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="option-input">
                            <input
                              type="radio"
                              name={`correct-${chapterIndex}-${questionIndex}`}
                              checked={question.correctOption === optionIndex}
                              onChange={() => handleQuizQuestionChange(
                                chapterIndex, 
                                questionIndex, 
                                'correctOption', 
                                optionIndex
                              )}
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                handleQuizQuestionChange(
                                  chapterIndex, 
                                  questionIndex, 
                                  'options', 
                                  newOptions
                                );
                              }}
                              required
                            />
                          </div>
                        ))}
                      </div>
                      <div className="form-group">
                        <label>Explication</label>
                        <textarea
                          value={question.explanation}
                          onChange={(e) => handleQuizQuestionChange(
                            chapterIndex, 
                            questionIndex, 
                            'explanation', 
                            e.target.value
                          )}
                          rows="2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Annuler
        </button>
        <button type="submit" className="submit-btn" disabled={!courseData.title || !courseData.description || !courseData.category}>
          Créer le cours
        </button>
      </div>
    </form>
  );
}

export default CourseForm;