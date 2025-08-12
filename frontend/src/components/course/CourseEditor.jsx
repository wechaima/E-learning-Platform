import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiChevronDown, FiMenu, FiArrowLeft } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './CourseEditor.css';

function CourseEditor({ onSubmit, onCancel, initialData }) {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    chapters: []
  });

  const [selectedItem, setSelectedItem] = useState({ 
    type: 'course', 
    index: null,
    chapterIndex: null,
    sectionIndex: null,
    quizIndex: null
  });

  const [editorContents, setEditorContents] = useState({});

 useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        description: initialData.description || '', // Ensure description is set
        chapters: (initialData.chapters || []).map((chapter, chapterIndex) => ({
          ...chapter,
          _id: chapter._id || `chapter-${Date.now()}-${chapterIndex}`,
          order: chapter.order || chapterIndex + 1,
          sections: (chapter.sections || []).map((section, sectionIndex) => ({
            ...section,
            _id: section._id || `section-${Date.now()}-${sectionIndex}`,
            order: section.order || sectionIndex + 1,
            content: section.content || '',
            videoUrl: section.videoUrl || ''
          })),
          quiz: chapter.quiz ? {
            ...chapter.quiz,
            passingScore: chapter.quiz.passingScore || 70,
            questions: (chapter.quiz.questions || []).map((question, qIndex) => ({
              ...question,
              _id: question._id || `question-${Date.now()}-${qIndex}`,
              text: question.text || '',
              options: question.options || ['', '', '', ''],
              correctOption: Array.isArray(question.correctOption) 
                ? question.correctOption 
                : (question.correctOption != null ? [question.correctOption] : []),
              explanation: question.explanation || '',
              multipleAnswers: Array.isArray(question.correctOption) 
                ? question.correctOption.length > 1 
                : false
            }))
          } : {
            passingScore: 70,
            questions: []
          }
        }))
      };

      const contents = {};
      formattedData.chapters.forEach((chapter, chapIdx) => {
        chapter.sections.forEach((section, secIdx) => {
          contents[`${chapIdx}-${secIdx}`] = section.content || '';
        });
      });

      setEditorContents(contents);
      setCourseData(formattedData);
    }
  }, [initialData]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[index][field] = value;
    setCourseData({ ...courseData, chapters: updatedChapters });
  };

  const handleSectionChange = (chapterIndex, sectionIndex, field, value) => {
    const updatedChapters = [...courseData.chapters];
    
    if (!updatedChapters[chapterIndex].sections[sectionIndex]) {
      updatedChapters[chapterIndex].sections[sectionIndex] = {
        _id: `section-${Date.now()}-${chapterIndex}-${sectionIndex}`,
        title: `Section ${sectionIndex + 1}`,
        content: '',
        videoUrl: '',
        order: sectionIndex + 1
      };
    }
    
    updatedChapters[chapterIndex].sections[sectionIndex][field] = value;
    setCourseData({ ...courseData, chapters: updatedChapters });

    if (field === 'content') {
      setEditorContents(prev => ({
        ...prev,
        [`${chapterIndex}-${sectionIndex}`]: value
      }));
    }
  };

  const handleQuizChange = (chapterIndex, field, value) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].quiz[field] = value;
    setCourseData({ ...courseData, chapters: updatedChapters });
  };

  const handleQuestionChange = (chapterIndex, questionIndex, field, value) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].quiz.questions[questionIndex][field] = value;
    setCourseData({ ...courseData, chapters: updatedChapters });
  };

  const handleOptionChange = (chapterIndex, questionIndex, optionIndex, value) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].quiz.questions[questionIndex].options[optionIndex] = value;
    setCourseData({ ...courseData, chapters: updatedChapters });
  };

  const handleCorrectOptionChange = (chapterIndex, questionIndex, optionIndex, isMultiple) => {
    const updatedChapters = [...courseData.chapters];
    if (isMultiple) {
      const currentAnswers = updatedChapters[chapterIndex].quiz.questions[questionIndex].correctOption || [];
      if (currentAnswers.includes(optionIndex)) {
        updatedChapters[chapterIndex].quiz.questions[questionIndex].correctOption = 
          currentAnswers.filter(i => i !== optionIndex);
      } else {
        updatedChapters[chapterIndex].quiz.questions[questionIndex].correctOption = 
          [...currentAnswers, optionIndex];
      }
    } else {
      updatedChapters[chapterIndex].quiz.questions[questionIndex].correctOption = [optionIndex];
    }
    setCourseData({ ...courseData, chapters: updatedChapters });
  };

  const addChapter = () => {
    const newChapter = {
      _id: `chapter-${Date.now()}`,
      title: `Chapitre ${courseData.chapters.length + 1}`,
      order: courseData.chapters.length + 1,
      sections: [],
      quiz: {
        passingScore: 70,
        questions: []
      }
    };
    
    setCourseData({
      ...courseData,
      chapters: [...courseData.chapters, newChapter]
    });
    setSelectedItem({ 
      type: 'chapter', 
      index: courseData.chapters.length 
    });
  };

  const addSection = (chapterIndex) => {
    const updatedChapters = [...courseData.chapters];
    const newSectionIndex = updatedChapters[chapterIndex].sections.length;
    
    const newSection = {
      _id: `section-${Date.now()}-${chapterIndex}-${newSectionIndex}`,
      title: `Section ${newSectionIndex + 1}`,
      content: '',
      videoUrl: '',
      order: newSectionIndex + 1
    };
    
    updatedChapters[chapterIndex].sections.push(newSection);
    
    setCourseData({ ...courseData, chapters: updatedChapters });
    setSelectedItem({ 
      type: 'section', 
      chapterIndex,
      sectionIndex: newSectionIndex
    });

    setEditorContents(prev => ({
      ...prev,
      [`${chapterIndex}-${newSectionIndex}`]: ''
    }));
  };

  const addQuizQuestion = (chapterIndex) => {
    const updatedChapters = [...courseData.chapters];
    const questionCount = updatedChapters[chapterIndex].quiz.questions.length;
    
    updatedChapters[chapterIndex].quiz.questions.push({
      _id: `question-${Date.now()}-${chapterIndex}-${questionCount}`,
      text: '',
      options: ['', '', '', ''],
      correctOption: [],
      explanation: '',
      multipleAnswers: false
    });
    
    setCourseData({ ...courseData, chapters: updatedChapters });
    setSelectedItem({
      type: 'quiz',
      chapterIndex,
      quizIndex: questionCount
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const updatedChapters = [...courseData.chapters];
    const chapterIndex = parseInt(source.droppableId.split('-')[1]);
    const chapter = updatedChapters[chapterIndex];
    
    const [movedSection] = chapter.sections.splice(source.index, 1);
    chapter.sections.splice(destination.index, 0, movedSection);
    
    chapter.sections.forEach((section, idx) => {
      section.order = idx + 1;
    });

    setCourseData({ ...courseData, chapters: updatedChapters });
  };

  const deleteChapter = (index) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters.splice(index, 1);
    
    updatedChapters.forEach((chap, idx) => {
      chap.order = idx + 1;
    });
    
    setCourseData({ ...courseData, chapters: updatedChapters });
    if (selectedItem.type === 'chapter' && selectedItem.index === index) {
      setSelectedItem({ type: 'course', index: null });
    }
  };

  const deleteSection = (chapterIndex, sectionIndex) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].sections.splice(sectionIndex, 1);
    
    updatedChapters[chapterIndex].sections.forEach((sec, idx) => {
      sec.order = idx + 1;
    });
    
    setCourseData({ ...courseData, chapters: updatedChapters });
    if (selectedItem.type === 'section' && 
        selectedItem.chapterIndex === chapterIndex && 
        selectedItem.sectionIndex === sectionIndex) {
      setSelectedItem({ type: 'chapter', index: chapterIndex });
    }

    setEditorContents(prev => {
      const newContents = {...prev};
      delete newContents[`${chapterIndex}-${sectionIndex}`];
      return newContents;
    });
  };

  const deleteQuestion = (chapterIndex, questionIndex) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[chapterIndex].quiz.questions.splice(questionIndex, 1);
    setCourseData({ ...courseData, chapters: updatedChapters });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const chaptersWithUpdatedContent = courseData.chapters.map((chapter, chapIdx) => ({
      ...chapter,
      sections: chapter.sections.map((section, secIdx) => ({
        ...section,
        content: editorContents[`${chapIdx}-${secIdx}`] || section.content
      }))
    }));

    onSubmit({
      ...courseData,
      chapters: chaptersWithUpdatedContent
    });
  };

  return (
    <div className="course-editor-container">
      <div className="course-sidebar">
        <div 
          className={`sidebar-item course-title ${selectedItem.type === 'course' ? 'active' : ''}`}
          onClick={() => setSelectedItem({ type: 'course', index: null })}
        >
          <FiArrowLeft size={18} className="back-icon" />
          <h3>{courseData.title || 'Nouveau cours'}</h3>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          {courseData.chapters.map((chapter, chapterIndex) => (
            <div key={chapter._id} className="chapter-container">
              <div 
                className={`sidebar-item chapter ${selectedItem.type === 'chapter' && selectedItem.index === chapterIndex ? 'active' : ''}`}
                onClick={() => setSelectedItem({ 
                  type: 'chapter', 
                  index: chapterIndex 
                })}
              >
                <div className="chapter-header">
                  <FiChevronDown size={16} />
                  <span>{chapter.title}</span>
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChapter(chapterIndex);
                    }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              <Droppable droppableId={`chapter-${chapterIndex}`}>
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="sections-list"
                  >
                    {chapter.sections.map((section, sectionIndex) => (
                      <Draggable
                        key={section._id}
                        draggableId={section._id}
                        index={sectionIndex}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`sidebar-item section ${selectedItem.type === 'section' && selectedItem.chapterIndex === chapterIndex && selectedItem.sectionIndex === sectionIndex ? 'active' : ''}`}
                            onClick={() => setSelectedItem({
                              type: 'section',
                              chapterIndex,
                              sectionIndex
                            })}
                          >
                            <div className="section-header">
                              <FiMenu size={14} />
                              <span>{section.title}</span>
                              <button 
                                className="delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSection(chapterIndex, sectionIndex);
                                }}
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div 
                className={`sidebar-item quiz ${selectedItem.type === 'quiz' && selectedItem.chapterIndex === chapterIndex ? 'active' : ''}`}
                onClick={() => setSelectedItem({ 
                  type: 'quiz', 
                  chapterIndex 
                })}
              >
                <div className="quiz-header">
                  <span>Quiz du chapitre</span>
                </div>
              </div>

              <div className="sidebar-actions">
                <button 
                  onClick={() => addSection(chapterIndex)}
                  className="add-btn"
                >
                  <FiPlus size={14} /> Ajouter une section
                </button>
              </div>
            </div>
          ))}
        </DragDropContext>

        <button onClick={addChapter} className="add-btn">
          <FiPlus /> Ajouter un chapitre
        </button>
      </div>

      <form onSubmit={handleSubmit} className="course-editor-form">
        {selectedItem.type === 'course' && (
          <div className="form-section">
            <h2>Informations du cours</h2>
            
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
              <CKEditor
                editor={ClassicEditor}
                data={courseData.description}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setCourseData({ ...courseData, description: data });
                }}
              />
            </div>

            <div className="form-group">
              <label>Image du cours</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCourseData({ ...courseData, imageUrl: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {courseData.imageUrl && (
                <img 
                  src={courseData.imageUrl} 
                  alt="Aperçu" 
                  className="image-preview"
                />
              )}
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
          </div>
        )}

        {selectedItem.type === 'chapter' && (
          <div className="form-section">
            <h2>Édition du chapitre</h2>
            <div className="form-group">
              <label>Titre du chapitre*</label>
              <input
                type="text"
                value={courseData.chapters[selectedItem.index].title}
                onChange={(e) => handleChapterChange(
                  selectedItem.index,
                  'title',
                  e.target.value
                )}
                required
              />
            </div>
          </div>
        )}

        {selectedItem.type === 'section' && (
          <div className="form-section">
            <h2>Édition de la section</h2>
            <div className="form-group">
              <label>Titre de la section*</label>
              <input
                type="text"
                value={courseData.chapters[selectedItem.chapterIndex]?.sections[selectedItem.sectionIndex]?.title || ''}
                onChange={(e) => handleSectionChange(
                  selectedItem.chapterIndex,
                  selectedItem.sectionIndex,
                  'title',
                  e.target.value
                )}
                required
              />
            </div>

            <div className="form-group">
              <label>Contenu</label>
              <CKEditor
                key={`editor-${selectedItem.chapterIndex}-${selectedItem.sectionIndex}`}
                editor={ClassicEditor}
                data={editorContents[`${selectedItem.chapterIndex}-${selectedItem.sectionIndex}`] || ''}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleSectionChange(
                    selectedItem.chapterIndex,
                    selectedItem.sectionIndex,
                    'content',
                    data
                  );
                }}
                onBlur={(event, editor) => {
                  const data = editor.getData();
                  handleSectionChange(
                    selectedItem.chapterIndex,
                    selectedItem.sectionIndex,
                    'content',
                    data
                  );
                }}
                config={{
                  autoParagraph: false,
                  fillEmptyBlocks: false,
                  removePlugins: ['Title']
                }}
              />
            </div>

            <div className="form-group">
              <label>URL de la vidéo</label>
              <input
                type="text"
                value={courseData.chapters[selectedItem.chapterIndex]?.sections[selectedItem.sectionIndex]?.videoUrl || ''}
                onChange={(e) => handleSectionChange(
                  selectedItem.chapterIndex,
                  selectedItem.sectionIndex,
                  'videoUrl',
                  e.target.value
                )}
              />
            </div>
          </div>
        )}

        {selectedItem.type === 'quiz' && (
          <div className="form-section">
            <h2>Quiz du chapitre</h2>
            
            <div className="form-group">
              <label>Score de passage (%)*</label>
              <input
                type="number"
                min="0"
                max="100"
                value={courseData.chapters[selectedItem.chapterIndex].quiz.passingScore}
                onChange={(e) => handleQuizChange(
                  selectedItem.chapterIndex,
                  'passingScore',
                  parseInt(e.target.value) || 0
                )}
                required
              />
            </div>

            <div className="quiz-questions">
              <h3>Questions</h3>
              
              {courseData.chapters[selectedItem.chapterIndex].quiz.questions.map((question, questionIndex) => (
                <div key={question._id} className="question-card">
                  <div className="question-header">
                    <h4>Question {questionIndex + 1}</h4>
                    <button
                      className="delete-btn"
                      onClick={() => deleteQuestion(selectedItem.chapterIndex, questionIndex)}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Question*</label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(
                        selectedItem.chapterIndex,
                        questionIndex,
                        'text',
                        e.target.value
                      )}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Type de réponse</label>
                    <select
                      value={question.multipleAnswers ? 'multiple' : 'single'}
                      onChange={(e) => handleQuestionChange(
                        selectedItem.chapterIndex,
                        questionIndex,
                        'multipleAnswers',
                        e.target.value === 'multiple'
                      )}
                    >
                      <option value="single">Une seule réponse correcte</option>
                      <option value="multiple">Plusieurs réponses possibles</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Options*</label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="option-input">
                        <input
                          type={question.multipleAnswers ? "checkbox" : "radio"}
                          name={`question-${selectedItem.chapterIndex}-${questionIndex}`}
                          checked={question.correctOption?.includes(optionIndex)}
                          onChange={() => handleCorrectOptionChange(
                            selectedItem.chapterIndex,
                            questionIndex,
                            optionIndex,
                            question.multipleAnswers
                          )}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(
                            selectedItem.chapterIndex,
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )}
                          placeholder={`Option ${optionIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label>Explication</label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => handleQuestionChange(
                        selectedItem.chapterIndex,
                        questionIndex,
                        'explanation',
                        e.target.value
                      )}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addQuizQuestion(selectedItem.chapterIndex)}
                className="add-btn"
              >
                <FiPlus /> Ajouter une question
              </button>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Annuler
          </button>
          <button type="submit" className="submit-btn">
            {initialData ? 'Mettre à jour le cours' : 'Créer le cours'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CourseEditor;