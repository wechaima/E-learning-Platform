import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiTrash2, FiChevronDown, FiMenu, FiArrowLeft } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism-tomorrow.css";
import './CourseEditor.css';

const editorConfiguration = {
  toolbar: {
    items: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'codeBlock',
      'blockQuote',
      'insertTable',
      '|',
      'undo',
      'redo'
    ]
  },
  codeBlock: {
    languages: [
      { language: 'javascript', label: 'JavaScript' },
      { language: 'python', label: 'Python' },
      { language: 'html', label: 'HTML' },
      { language: 'css', label: 'CSS' },
      { language: 'jsx', label: 'JSX' }
    ]
  }
};

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
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [editorInstance, setEditorInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizErrors, setQuizErrors] = useState({});
  const [pastedContent, setPastedContent] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const pasteTargetRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        title: initialData.title || '',
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        category: initialData.category || '',
        chapters: (initialData.chapters || []).map((chapter, chapterIndex) => ({
          _id: chapter._id || `chapter-${Date.now()}-${chapterIndex}`,
          title: chapter.title || `Chapitre ${chapterIndex + 1}`,
          order: chapter.order || chapterIndex + 1,
          sections: (chapter.sections || []).map((section, sectionIndex) => ({
            _id: section._id || `section-${Date.now()}-${chapterIndex}-${sectionIndex}`,
            title: section.title || `Section ${sectionIndex + 1}`,
            content: section.content || '',
            videoUrl: section.videoUrl || '',
            order: section.order || sectionIndex + 1,
            duration: section.duration || 0
          })),
          quiz: chapter.quiz ? {
            _id: chapter.quiz._id || `quiz-${Date.now()}-${chapterIndex}`,
            passingScore: chapter.quiz.passingScore || 70,
            questions: (chapter.quiz.questions || []).map((question, qIndex) => ({
              _id: question._id || `question-${Date.now()}-${chapterIndex}-${qIndex}`,
              text: question.text || '',
              options: question.options || ['', '', '', ''],
              correctOption: Array.isArray(question.correctOption) 
                ? question.correctOption 
                : [question.correctOption].filter(v => v !== undefined),
              explanation: question.explanation || '',
              points: question.points || 1
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
          contents[`${chapIdx}-${secIdx}`] = section.content;
        });
      });

      setEditorContents(contents);
      setCourseData(formattedData);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({ ...prev, [name]: value }));
  };

  const handleChapterChange = (index, field, value) => {
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[index] = { ...updatedChapters[index], [field]: value };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleSectionChange = (chapterIndex, sectionIndex, field, value) => {
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      const updatedSections = [...updatedChapters[chapterIndex].sections];
      
      if (!updatedSections[sectionIndex]) {
        updatedSections[sectionIndex] = {
          _id: `section-${Date.now()}-${chapterIndex}-${sectionIndex}`,
          title: `Section ${sectionIndex + 1}`,
          content: '',
          videoUrl: '',
          order: sectionIndex + 1
        };
      }
      
      updatedSections[sectionIndex] = { 
        ...updatedSections[sectionIndex], 
        [field]: value 
      };
      updatedChapters[chapterIndex] = { 
        ...updatedChapters[chapterIndex], 
        sections: updatedSections 
      };
      
      return { ...prev, chapters: updatedChapters };
    });

    if (field === 'content') {
      setEditorContents(prev => ({
        ...prev,
        [`${chapterIndex}-${sectionIndex}`]: value
      }));
    }
  };

  const handleQuizChange = (chapterIndex, field, value) => {
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex] = { 
        ...updatedChapters[chapterIndex], 
        quiz: { 
          ...updatedChapters[chapterIndex].quiz, 
          [field]: value 
        } 
      };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleQuestionChange = (chapterIndex, questionIndex, field, value) => {
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      const updatedQuestions = [...updatedChapters[chapterIndex].quiz.questions];
      updatedQuestions[questionIndex] = { 
        ...updatedQuestions[questionIndex], 
        [field]: value 
      };
      updatedChapters[chapterIndex] = { 
        ...updatedChapters[chapterIndex], 
        quiz: { 
          ...updatedChapters[chapterIndex].quiz, 
          questions: updatedQuestions 
        } 
      };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleOptionChange = (chapterIndex, questionIndex, optionIndex, value) => {
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      const updatedOptions = [...updatedChapters[chapterIndex].quiz.questions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      
      const updatedQuestions = [...updatedChapters[chapterIndex].quiz.questions];
      updatedQuestions[questionIndex] = { 
        ...updatedQuestions[questionIndex], 
        options: updatedOptions 
      };
      
      updatedChapters[chapterIndex] = { 
        ...updatedChapters[chapterIndex], 
        quiz: { 
          ...updatedChapters[chapterIndex].quiz, 
          questions: updatedQuestions 
        } 
      };
      
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleCorrectOptionChange = (chapterIndex, questionIndex, optionIndex, isMultiple) => {
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      const question = updatedChapters[chapterIndex].quiz.questions[questionIndex];
      
      let newCorrectOptions;
      if (isMultiple) {
        const currentAnswers = question.correctOption || [];
        newCorrectOptions = currentAnswers.includes(optionIndex)
          ? currentAnswers.filter(i => i !== optionIndex)
          : [...currentAnswers, optionIndex];
      } else {
        newCorrectOptions = [optionIndex];
      }
      
      const updatedQuestions = [...updatedChapters[chapterIndex].quiz.questions];
      updatedQuestions[questionIndex] = { 
        ...question, 
        correctOption: newCorrectOptions 
      };
      
      updatedChapters[chapterIndex] = { 
        ...updatedChapters[chapterIndex], 
        quiz: { 
          ...updatedChapters[chapterIndex].quiz, 
          questions: updatedQuestions 
        } 
      };
      
      return { ...prev, chapters: updatedChapters };
    });
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
    
    setCourseData(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter]
    }));
    setSelectedItem({ 
      type: 'chapter', 
      index: courseData.chapters.length 
    });
  };

  const addSection = (chapterIndex) => {
    const newSectionIndex = courseData.chapters[chapterIndex].sections.length;
    
    const newSection = {
      _id: `section-${Date.now()}-${chapterIndex}-${newSectionIndex}`,
      title: `Section ${newSectionIndex + 1}`,
      content: '',
      videoUrl: '',
      order: newSectionIndex + 1
    };
    
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        sections: [...updatedChapters[chapterIndex].sections, newSection]
      };
      return { ...prev, chapters: updatedChapters };
    });

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
    const questionCount = courseData.chapters[chapterIndex].quiz.questions.length;
    
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        quiz: {
          ...updatedChapters[chapterIndex].quiz,
          questions: [
            ...updatedChapters[chapterIndex].quiz.questions,
            {
              _id: `question-${Date.now()}-${chapterIndex}-${questionCount}`,
              text: '',
              options: ['', '', '', ''],
              correctOption: [],
              explanation: '',
              multipleAnswers: false
            }
          ]
        }
      };
      return { ...prev, chapters: updatedChapters };
    });

    setSelectedItem({
      type: 'quiz',
      chapterIndex,
      quizIndex: questionCount
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const chapterIndex = parseInt(source.droppableId.split('-')[1]);
    
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      const chapter = updatedChapters[chapterIndex];
      const [movedSection] = chapter.sections.splice(source.index, 1);
      chapter.sections.splice(destination.index, 0, movedSection);
      
      chapter.sections.forEach((section, idx) => {
        section.order = idx + 1;
      });

      return { ...prev, chapters: updatedChapters };
    });
  };

  const deleteChapter = (index) => {
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters.splice(index, 1);
      
      updatedChapters.forEach((chap, idx) => {
        chap.order = idx + 1;
      });
      
      return { ...prev, chapters: updatedChapters };
    });

    if (selectedItem.type === 'chapter' && selectedItem.index === index) {
      setSelectedItem({ type: 'course', index: null });
    }
  };

  const deleteSection = (chapterIndex, sectionIndex) => {
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        sections: updatedChapters[chapterIndex].sections.filter((_, idx) => idx !== sectionIndex)
      };
      
      updatedChapters[chapterIndex].sections.forEach((sec, idx) => {
        sec.order = idx + 1;
      });
      
      return { ...prev, chapters: updatedChapters };
    });

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
    setCourseData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        quiz: {
          ...updatedChapters[chapterIndex].quiz,
          questions: updatedChapters[chapterIndex].quiz.questions.filter((_, idx) => idx !== questionIndex)
        }
      };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const insertCode = () => {
    if (editorInstance) {
      const codeBlock = `\n\`\`\`${codeLanguage}\n${currentCode}\n\`\`\`\n`;
      editorInstance.model.change(writer => {
        const insertPosition = editorInstance.model.document.selection.getFirstPosition();
        writer.insertText(codeBlock, insertPosition);
      });
      setShowCodeEditor(false);
      setCurrentCode('');
    }
  };

  const handlePaste = (event, editor) => {
    // Vérifier si le contenu collé contient du code avec coloration
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text/plain');
    const pastedHtml = clipboardData.getData('text/html');
    
    // Si le HTML contient des spans avec des styles (coloration syntaxique)
    if (pastedHtml && pastedHtml.includes('span style')) {
      event.preventDefault();
      
      // Stocker le contenu et la cible pour traitement
      setPastedContent(pastedText);
      pasteTargetRef.current = editor;
      setShowPasteModal(true);
    }
  };

  const handlePasteConfirm = () => {
    if (pasteTargetRef.current) {
      const codeBlock = `\n\`\`\`${codeLanguage}\n${pastedContent}\n\`\`\`\n`;
      pasteTargetRef.current.model.change(writer => {
        const insertPosition = pasteTargetRef.current.model.document.selection.getFirstPosition();
        writer.insertText(codeBlock, insertPosition);
      });
    }
    
    setShowPasteModal(false);
    setPastedContent('');
    pasteTargetRef.current = null;
  };

  const validateQuizQuestions = () => {
    const errors = {};
    let isValid = true;

    courseData.chapters.forEach((chapter, chapterIndex) => {
      if (chapter.quiz && chapter.quiz.questions.length > 0) {
        chapter.quiz.questions.forEach((question, questionIndex) => {
          if (!question.correctOption || question.correctOption.length === 0) {
            errors[`${chapterIndex}-${questionIndex}`] = 'Veuillez sélectionner au moins une réponse correcte';
            isValid = false;
          }
        });
      }
    });

    setQuizErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateQuizQuestions()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const chaptersWithUpdatedContent = courseData.chapters.map((chapter, chapIdx) => ({
        ...chapter,
        sections: chapter.sections.map((section, secIdx) => ({
          ...section,
          content: editorContents[`${chapIdx}-${secIdx}`] || section.content
        })),
        quiz: chapter.quiz ? {
          ...chapter.quiz,
          questions: chapter.quiz.questions.map(question => ({
            ...question,
            correctOption: Array.isArray(question.correctOption) 
              ? question.correctOption 
              : [question.correctOption].filter(v => v !== undefined)
          }))
        } : undefined
      }));

      await onSubmit({
        ...courseData,
        chapters: chaptersWithUpdatedContent
      });
    } catch (error) {
      console.error("Erreur lors de la soumission du cours:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const highlightCode = (code) => {
    switch(codeLanguage) {
      case 'javascript': return highlight(code, languages.javascript, 'javascript');
      case 'python': return highlight(code, languages.python, 'python');
      case 'jsx': return highlight(code, languages.jsx, 'jsx');
      case 'html': return highlight(code, languages.html, 'html');
      case 'css': return highlight(code, languages.css, 'css');
      default: return highlight(code, languages.javascript, 'javascript');
    }
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
                config={editorConfiguration}
                data={courseData.description}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setCourseData(prev => ({ ...prev, description: data }));
                }}
                onReady={editor => {
                  setEditorInstance(editor);
                }}
                onPaste={(event, editor) => handlePaste(event, editor)}
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
                      setCourseData(prev => ({ ...prev, imageUrl: reader.result }));
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
              <div className="editor-container">
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfiguration}
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
                  onReady={editor => {
                    setEditorInstance(editor);
                  }}
                  onPaste={(event, editor) => handlePaste(event, editor)}
                  key={`${selectedItem.chapterIndex}-${selectedItem.sectionIndex}`}
                />
                
                <button 
                  type="button"
                  className="add-code-btn"
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                >
                  {showCodeEditor ? 'Masquer l\'éditeur de code' : 'Ajouter du code'}
                </button>
                
                {showCodeEditor && (
                  <div className="code-editor-modal">
                    <div className="code-editor-header">
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="language-selector"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="jsx">JSX</option>
                      </select>
                      
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(currentCode)}
                        className="copy-btn"
                      >
                        Copier
                      </button>
                      
                      <button
                        type="button"
                        onClick={insertCode}
                        className="insert-btn"
                      >
                        Insérer
                      </button>
                    </div>
                    
                    <div className="code-editor-content">
                      <Editor
                        value={currentCode}
                        onValueChange={setCurrentCode}
                        highlight={highlightCode}
                        padding={10}
                        style={{
                          fontFamily: '"Fira Code", "Fira Mono", monospace',
                          fontSize: 14,
                          backgroundColor: '#2d2d2d',
                          minHeight: '200px',
                          border: '1px solid #444'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
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
                    {quizErrors[`${selectedItem.chapterIndex}-${questionIndex}`] && (
                      <div className="error-message">
                        {quizErrors[`${selectedItem.chapterIndex}-${questionIndex}`]}
                      </div>
                    )}
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
          <button 
            type="button" 
            onClick={onCancel} 
            className="cancel-btn"
            disabled={isSubmitting}
          >
            Annuler
          </button>
        
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'En cours...' : 
             initialData ? 'Mettre à jour le cours' : 'Créer le cours'}
          </button>
        </div>
      </form>

      {/* Modal pour le collage de code */}
      {showPasteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Collage de code détecté</h3>
            <p>Vous avez collé du code avec mise en forme. Souhaitez-vous le formater en tant que bloc de code?</p>
            <div className="code-preview">
              <pre>{pastedContent}</pre>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowPasteModal(false)}
                className="cancel-btn"
              >
                Annuler
              </button>
              <button 
                onClick={handlePasteConfirm}
                className="confirm-btn"
              >
                Formater comme code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseEditor;