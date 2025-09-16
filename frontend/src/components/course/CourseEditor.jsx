import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiTrash2, FiChevronDown, FiMenu, FiArrowLeft, FiImage, FiGrid, FiType, } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import 'react-syntax-highlighter/dist/esm/languages/prism/python';
import 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import 'react-syntax-highlighter/dist/esm/languages/prism/css';
import 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import 'react-syntax-highlighter/dist/esm/languages/prism/java';
import 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import 'react-syntax-highlighter/dist/esm/languages/prism/php';
import 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CourseEditor.css';

// Configuration des modules Quill avec les nouvelles fonctionnalités
const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image', { 'symbol': '<i class="fas fa-symbol"></i>' }], // Modification ici
      ['clean'],
    ],
    handlers: {
      image: function() {
        // Cette fonction sera remplacée dynamiquement
      },
      symbol: function() {
        // Cette fonction sera remplacée dynamiquement
      }
    }
  },
  syntax: {
    highlight: (text) => hljs.highlightAuto(text).value,
  },
};
const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align',
  'list', 'bullet', 'indent',
  'link', 'blockquote', 'code-block', 'image'
];

const availableLanguages = {
  javascript: 'JavaScript',
  python: 'Python',
  jsx: 'JSX',
  css: 'CSS',
  xml: 'HTML',
  java: 'Java',
  typescript: 'TypeScript',
  php: 'PHP',
  ruby: 'Ruby',
};

// Symboles spéciaux disponibles
const specialSymbols = [
  '©', '®', '™', '€', '$', '£', '¥', '¢', '§', '¶', '†', '‡', '•', '–', '—',
  '°', '±', '×', '÷', '¼', '½', '¾', '≠', '≈', '≡', '≤', '≥', '∞', '√', '∆',
  '∑', '∏', '∂', '∫', '¬', '∧', '∨', '∩', '∪', '∈', '∉', '⊂', '⊃', '⊆', '⊇',
  'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο',
  'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', '→', '←', '↑', '↓', '↔', '↕',
];

function CourseEditor({ onSubmit, onCancel, initialData }) {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    chapters: [],
  });

  const [selectedItem, setSelectedItem] = useState({
    type: 'course',
    index: null,
    chapterIndex: null,
    sectionIndex: null,
    quizIndex: null,
  });

  const [editorContents, setEditorContents] = useState({});
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizErrors, setQuizErrors] = useState({});
  const [showSymbolsModal, setShowSymbolsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageAlt, setImageAlt] = useState('');

  const quillRefs = useRef({});
  const currentEditorKey = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      console.log('Initial data received:', JSON.stringify(initialData, null, 2));
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
            duration: section.duration || 0,
          })),
          quiz: chapter.quiz
            ? {
                _id: chapter.quiz._id || `quiz-${Date.now()}-${chapterIndex}`,
                passingScore: chapter.quiz.passingScore || 70,
                questions: (chapter.quiz.questions || []).map((question, qIndex) => {
                  // Vérifier la structure des options
                  const options = Array.isArray(question.options) 
                    ? question.options.map(opt => typeof opt === 'string' ? opt : opt.text || '')
                    : ['', '', '', ''];
                  
                  // Vérifier la structure des réponses correctes
                  let correctOption = [];
                  if (Array.isArray(question.correctOption)) {
                    correctOption = question.correctOption;
                  } else if (typeof question.correctOption === 'number') {
                    correctOption = [question.correctOption];
                  } else if (question.options && question.options.some(opt => opt.isCorrect)) {
                    // Si les réponses correctes sont stockées dans les options
                    correctOption = question.options
                      .map((opt, index) => (opt.isCorrect ? index : -1))
                      .filter(index => index !== -1);
                  }
                  
                  return {
                    _id: question._id || `question-${Date.now()}-${chapterIndex}-${qIndex}`,
                    text: question.text || '',
                    options: options,
                    correctOption: correctOption,
                    explanation: question.explanation || '',
                    points: question.points || 1,
                    multipleAnswers: correctOption.length > 1
                  };
                }),
              }
            : {
                passingScore: 70,
                questions: [],
              },
        })),
      };

      const contents = {};
      formattedData.chapters.forEach((chapter, chapIdx) => {
        chapter.sections.forEach((section, secIdx) => {
          const key = `${chapIdx}-${secIdx}`;
          contents[key] = section.content;
        });
      });

      setEditorContents(contents);
      setCourseData(formattedData);
    }
  }, [initialData]);

  useEffect(() => {
    // Configuration des gestionnaires pour Quill
    Object.keys(quillRefs.current).forEach((key) => {
      if (quillRefs.current[key] && quillRefs.current[key].getEditor) {
        const toolbar = quillRefs.current[key].getEditor().getModule('toolbar');
        
        // Gestionnaire pour l'image
        toolbar.addHandler('image', () => {
          setShowImageModal(true);
          currentEditorKey.current = key;
        });
        
        // Gestionnaire pour le symbole
        toolbar.addHandler('symbol', () => {
          setShowSymbolsModal(true);
          currentEditorKey.current = key;
        });
      }
    });
  }, [selectedItem]);

  const saveCurrentSectionContent = () => {
    if (
      selectedItem.type === 'section' &&
      selectedItem.chapterIndex !== null &&
      selectedItem.sectionIndex !== null
    ) {
      const key = `${selectedItem.chapterIndex}-${selectedItem.sectionIndex}`;
      const editor = quillRefs.current[key];

      if (editor && editor.getEditor) {
        try {
          const content = editor.getEditor().root.innerHTML;
          setEditorContents((prev) => ({
            ...prev,
            [key]: content,
          }));

          setCourseData((prev) => {
            const updatedChapters = [...prev.chapters];
            const updatedSections = [...updatedChapters[selectedItem.chapterIndex].sections];
            updatedSections[selectedItem.sectionIndex] = {
              ...updatedSections[selectedItem.sectionIndex],
              content,
            };
            updatedChapters[selectedItem.chapterIndex] = {
              ...updatedChapters[selectedItem.chapterIndex],
              sections: updatedSections,
            };
            return { ...prev, chapters: updatedChapters };
          });
        } catch (error) {
          console.error('Erreur lors de la sauvegarde du contenu:', error);
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChapterChange = (index, field, value) => {
    setCourseData((prev) => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[index] = { ...updatedChapters[index], [field]: value };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleSectionChange = (chapterIndex, sectionIndex, field, value) => {
    if (field === 'content') {
      const key = `${chapterIndex}-${sectionIndex}`;
      setEditorContents((prev) => ({
        ...prev,
        [key]: value,
      }));
    }

    setCourseData((prev) => {
      const updatedChapters = [...prev.chapters];
      const updatedSections = [...updatedChapters[chapterIndex].sections];

      if (!updatedSections[sectionIndex]) {
        updatedSections[sectionIndex] = {
          _id: `section-${Date.now()}-${chapterIndex}-${sectionIndex}`,
          title: `Section ${sectionIndex + 1}`,
          content: '',
          videoUrl: '',
          order: sectionIndex + 1,
        };
      }

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        [field]: value,
      };
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        sections: updatedSections,
      };

      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleQuizChange = (chapterIndex, field, value) => {
    setCourseData((prev) => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        quiz: {
          ...updatedChapters[chapterIndex].quiz,
          [field]: value,
        },
      };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleQuestionChange = (chapterIndex, questionIndex, field, value) => {
    setCourseData((prev) => {
      const updatedChapters = [...prev.chapters];
      const updatedQuestions = [...updatedChapters[chapterIndex].quiz.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value,
      };
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        quiz: {
          ...updatedChapters[chapterIndex].quiz,
          questions: updatedQuestions,
        },
      };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleOptionChange = (chapterIndex, questionIndex, optionIndex, value) => {
    setCourseData((prev) => {
      const updatedChapters = [...prev.chapters];
      const updatedOptions = [...updatedChapters[chapterIndex].quiz.questions[questionIndex].options];
      updatedOptions[optionIndex] = value;

      const updatedQuestions = [...updatedChapters[chapterIndex].quiz.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions,
      };

      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        quiz: {
          ...updatedChapters[chapterIndex].quiz,
          questions: updatedQuestions,
        },
      };

      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleCorrectOptionChange = (chapterIndex, questionIndex, optionIndex, isMultiple) => {
    setCourseData((prev) => {
      const updatedChapters = [...prev.chapters];
      const question = updatedChapters[chapterIndex].quiz.questions[questionIndex];

      let newCorrectOptions;
      if (isMultiple) {
        const currentAnswers = question.correctOption || [];
        newCorrectOptions = currentAnswers.includes(optionIndex)
          ? currentAnswers.filter((i) => i !== optionIndex)
          : [...currentAnswers, optionIndex];
      } else {
        newCorrectOptions = [optionIndex];
      }

      const updatedQuestions = [...updatedChapters[chapterIndex].quiz.questions];
      updatedQuestions[questionIndex] = {
        ...question,
        correctOption: newCorrectOptions,
      };

      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        quiz: {
          ...updatedChapters[chapterIndex].quiz,
          questions: updatedQuestions,
        },
      };

      return { ...prev, chapters: updatedChapters };
    });
  };

  const addChapter = () => {
    saveCurrentSectionContent();
    const newChapter = {
      _id: `chapter-${Date.now()}`,
      title: `Chapitre ${courseData.chapters.length + 1}`,
      order: courseData.chapters.length + 1,
      sections: [],
      quiz: {
        passingScore: 70,
        questions: [],
      },
    };

    setCourseData((prev) => ({
      ...prev,
      chapters: [...prev.chapters, newChapter],
    }));
    setSelectedItem({
      type: 'chapter',
      index: courseData.chapters.length,
    });
  };

  const addSection = (chapterIndex) => {
    saveCurrentSectionContent();
    const newSectionIndex = courseData.chapters[chapterIndex].sections.length;

    const newSection = {
      _id: `section-${Date.now()}-${chapterIndex}-${newSectionIndex}`,
      title: `Section ${newSectionIndex + 1}`,
      content: '',
      videoUrl: '',
      order: newSectionIndex + 1,
    };

    setCourseData((prev) => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        sections: [...updatedChapters[chapterIndex].sections, newSection],
      };
      return { ...prev, chapters: updatedChapters };
    });

    const key = `${chapterIndex}-${newSectionIndex}`;
    setEditorContents((prev) => ({
      ...prev,
      [key]: '',
    }));

    setSelectedItem({
      type: 'section',
      chapterIndex,
      sectionIndex: newSectionIndex,
    });
  };

  const addQuizQuestion = (chapterIndex) => {
    saveCurrentSectionContent();
    const questionCount = courseData.chapters[chapterIndex].quiz.questions.length;

    setCourseData((prev) => {
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
              multipleAnswers: false,
            },
          ],
        },
      };
      return { ...prev, chapters: updatedChapters };
    });

    setSelectedItem({
      type: 'quiz',
      chapterIndex,
      quizIndex: questionCount,
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const chapterIndex = parseInt(source.droppableId.split('-')[1]);

    setCourseData((prev) => {
      const updatedChapters = [...prev.chapters];
      const chapter = updatedChapters[chapterIndex];
      const [movedSection] = chapter.sections.splice(source.index, 1);
      chapter.sections.splice(destination.index, 0, movedSection);

      chapter.sections.forEach((section, idx) => {
        section.order = idx + 1;
      });

      return { ...prev, chapters: updatedChapters };
  })
  };

  const deleteChapter = (index) => {
    saveCurrentSectionContent();
    setCourseData((prev) => {
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
    saveCurrentSectionContent();
    setCourseData((prev) => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        sections: updatedChapters[chapterIndex].sections.filter((_, idx) => idx !== sectionIndex),
      };

      updatedChapters[chapterIndex].sections.forEach((sec, idx) => {
        sec.order = idx + 1;
      });

      return { ...prev, chapters: updatedChapters };
    });

    if (
      selectedItem.type === 'section' &&
      selectedItem.chapterIndex === chapterIndex &&
      selectedItem.sectionIndex === sectionIndex
    ) {
      setSelectedItem({ type: 'chapter', index: chapterIndex });
    }

    const key = `${chapterIndex}-${sectionIndex}`;
    setEditorContents((prev) => {
      const newContents = { ...prev };
      delete newContents[key];
      return newContents;
    });
  };

  const deleteQuestion = (chapterIndex, questionIndex) => {
    setCourseData((prev) => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        quiz: {
          ...updatedChapters[chapterIndex].quiz,
          questions: updatedChapters[chapterIndex].quiz.questions.filter((_, idx) => idx !== questionIndex),
        },
      };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const insertCode = () => {
    if (currentCode.trim()) {
      const escapedCode = currentCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      const codeBlock = `<pre class="ql-syntax" data-language="${codeLanguage}">${escapedCode}</pre>`;

      const editor = quillRefs.current[`${selectedItem.chapterIndex}-${selectedItem.sectionIndex}`];
      if (editor) {
        const range = editor.getEditor().getSelection();
        const insertIndex = range ? range.index : editor.getEditor().getLength();
        editor.getEditor().clipboard.dangerouslyPasteHTML(insertIndex, codeBlock);
      }

      setShowCodeEditor(false);
      setCurrentCode('');
    }
  };

  const setQuillRef = (id, el) => {
    if (el) {
      quillRefs.current[id] = el;
    }
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
      toast.error('Veuillez corriger les erreurs dans le quiz avant de soumettre.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    saveCurrentSectionContent();
    setIsSubmitting(true);

    try {
      const finalCourseData = { ...courseData };
      Object.entries(editorContents).forEach(([key, content]) => {
        const [chapterIndex, sectionIndex] = key.split('-').map(Number);
        if (finalCourseData.chapters[chapterIndex]?.sections[sectionIndex]) {
          finalCourseData.chapters[chapterIndex].sections[sectionIndex].content = content;
        }
      });

      await onSubmit(finalCourseData);
      toast.success(initialData ? 'Cours mis à jour avec succès !' : 'Cours créé avec succès !', {
        position: 'top-right',
        autoClose: 4000,
      });
    } catch (error) {
      console.error('Erreur lors de la soumission du cours:', error);
      toast.error('Une erreur est survenue lors de la soumission du cours.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetSelectedItem = (newItem) => {
    saveCurrentSectionContent();
    setSelectedItem(newItem);
  };

  const getCurrentContent = () => {
    if (
      selectedItem.type === 'section' &&
      selectedItem.chapterIndex !== null &&
      selectedItem.sectionIndex !== null
    ) {
      const key = `${selectedItem.chapterIndex}-${selectedItem.sectionIndex}`;
      return editorContents[key] || courseData.chapters[selectedItem.chapterIndex]?.sections[selectedItem.sectionIndex]?.content || '';
    }
    return '';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const insertImage = () => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const editor = quillRefs.current[currentEditorKey.current];
        if (editor) {
          const range = editor.getEditor().getSelection();
          const insertIndex = range ? range.index : editor.getEditor().getLength();
          editor.getEditor().insertEmbed(insertIndex, 'image', event.target.result);

          if (imageAlt.trim()) {
            setTimeout(() => {
              const images = editor.getEditor().root.querySelectorAll('img');
              const lastImage = images[images.length - 1];
              if (lastImage) {
                lastImage.alt = imageAlt;
              }
            }, 100);
          }
        }
      };
      reader.readAsDataURL(imageFile);

      setShowImageModal(false);
      setImageFile(null);
      setImageAlt('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const insertSymbol = (symbol) => {
    if (
      selectedItem.type === 'section' &&
      selectedItem.chapterIndex !== null &&
      selectedItem.sectionIndex !== null
    ) {
      const key = `${selectedItem.chapterIndex}-${selectedItem.sectionIndex}`;
      const editor = quillRefs.current[key];

      if (editor) {
        const range = editor.getEditor().getSelection();
        const insertIndex = range ? range.index : editor.getEditor().getLength();
        editor.getEditor().insertText(insertIndex, symbol);
      }
    }
    setShowSymbolsModal(false);
  };

  return (
    <div className="course-editor-container">
      <ToastContainer />

      {showSymbolsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Insérer un symbole</h3>
            <div className="symbols-grid">
              {specialSymbols.map((symbol, index) => (
                <button
                  key={index}
                  className="symbol-btn"
                  onClick={() => insertSymbol(symbol)}
                >
                  {symbol}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowSymbolsModal(false)} className="cancel-btn">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Insérer une image</h3>
            <div className="form-group">
              <label>Sélectionner une image*</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
              {imageFile && (
                <div className="image-preview-container">
                  <p>Aperçu:</p>
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Aperçu"
                    className="image-preview-small"
                  />
                </div>
              )}
            </div>
          
            <div className="modal-actions">
              <button onClick={() => setShowImageModal(false)} className="cancel-btn">
                Annuler
              </button>
              <button onClick={insertImage} className="submit-btn" disabled={!imageFile}>
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="course-sidebar">
        <div
          className={`sidebar-item course-title ${selectedItem.type === 'course' ? 'active' : ''}`}
          onClick={() => handleSetSelectedItem({ type: 'course', index: null })}
        >
          <FiArrowLeft size={18} className="back-icon" />
          <h3>{courseData.title || 'Nouveau cours'}</h3>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          {courseData.chapters.map((chapter, chapterIndex) => (
            <div key={chapter._id} className="chapter-container">
              <div
                className={`sidebar-item chapter ${
                  selectedItem.type === 'chapter' && selectedItem.index === chapterIndex ? 'active' : ''
                }`}
                onClick={() => handleSetSelectedItem({ type: 'chapter', index: chapterIndex })}
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
                  <div {...provided.droppableProps} ref={provided.innerRef} className="sections-list">
                    {chapter.sections.map((section, sectionIndex) => (
                      <Draggable key={section._id} draggableId={section._id} index={sectionIndex}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`sidebar-item section ${
                              selectedItem.type === 'section' &&
                              selectedItem.chapterIndex === chapterIndex &&
                              selectedItem.sectionIndex === sectionIndex
                                ? 'active'
                                : ''
                            }`}
                            onClick={() =>
                              handleSetSelectedItem({
                                type: 'section',
                                chapterIndex,
                                sectionIndex,
                              })
                            }
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
                className={`sidebar-item quiz ${
                  selectedItem.type === 'quiz' && selectedItem.chapterIndex === chapterIndex ? 'active' : ''
                }`}
                onClick={() => handleSetSelectedItem({ type: 'quiz', chapterIndex })}
              >
                <div className="quiz-header">
                  <span>Quiz du chapitre</span>
                </div>
              </div>

              <div className="sidebar-actions">
                <button onClick={() => addSection(chapterIndex)} className="add-btn">
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
              <ReactQuill
                value={courseData.description}
                onChange={(value) => setCourseData((prev) => ({ ...prev, description: value }))}
                modules={modules}
                formats={formats}
                theme="snow"
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
                      setCourseData((prev) => ({ ...prev, imageUrl: reader.result }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {courseData.imageUrl && (
                <img src={courseData.imageUrl} alt="Aperçu" className="image-preview" />
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
                onChange={(e) => handleChapterChange(selectedItem.index, 'title', e.target.value)}
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
                value={
                  courseData.chapters[selectedItem.chapterIndex]?.sections[selectedItem.sectionIndex]?.title || ''
                }
                onChange={(e) =>
                  handleSectionChange(selectedItem.chapterIndex, selectedItem.sectionIndex, 'title', e.target.value)
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Contenu</label>
              <div className="editor-container">
                <ReactQuill
                  key={`${selectedItem.chapterIndex}-${selectedItem.sectionIndex}`}
                  ref={(el) => setQuillRef(`${selectedItem.chapterIndex}-${selectedItem.sectionIndex}`, el)}
                  value={getCurrentContent()}
                  onChange={(value) =>
                    handleSectionChange(selectedItem.chapterIndex, selectedItem.sectionIndex, 'content', value)
                  }
                  modules={modules}
                  formats={formats}
                  theme="snow"
                />
                <button
                  type="button"
                  className="add-code-btn"
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                >
                  {showCodeEditor ? 'Masquer l\'éditeur de code' : 'Ajouter du code'}
                </button>
                {showCodeEditor && (
                  <div className="code-editor-section">
                    <div className="code-editor-header weldt">
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="language-selector"
                      >
                        {Object.entries(availableLanguages).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(currentCode)}
                        className="copy-btn"
                      >
                        Copier
                      </button>
                    </div>
                    <div className="code-editor-content">
                      <textarea
                        value={currentCode}
                        onChange={(e) => setCurrentCode(e.target.value)}
                        className="code-textarea"
                        placeholder="Écrivez votre code ici..."
                      />
                      <div className="code-preview">
                        <SyntaxHighlighter
                          language={codeLanguage}
                          style={atomDark}
                          customStyle={{
                            background: 'transparent',
                            padding: '10px',
                            margin: '0',
                            fontSize: '14px',
                            borderRadius: '4px',
                            border: '1px solid #444',
                            minHeight: '200px',
                          }}
                        >
                          {currentCode}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                    <div className="code-editor-actions">
                      <button type="button" onClick={insertCode} className="insert-btn">
                        Insérer dans l'éditeur
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCodeEditor(false)}
                        className="cancel-btn"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>URL de la vidéo</label>
              <input
                type="text"
                value={
                  courseData.chapters[selectedItem.chapterIndex]?.sections[selectedItem.sectionIndex]?.videoUrl || ''
                }
                onChange={(e) =>
                  handleSectionChange(selectedItem.chapterIndex, selectedItem.sectionIndex, 'videoUrl', e.target.value)
                }
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
                onChange={(e) =>
                  handleQuizChange(selectedItem.chapterIndex, 'passingScore', parseInt(e.target.value) || 0)
                }
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
                      onChange={(e) =>
                        handleQuestionChange(selectedItem.chapterIndex, questionIndex, 'text', e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type de réponse</label>
                    <select
                      value={question.multipleAnswers ? 'multiple' : 'single'}
                      onChange={(e) =>
                        handleQuestionChange(
                          selectedItem.chapterIndex,
                          questionIndex,
                          'multipleAnswers',
                          e.target.value === 'multiple'
                        )
                      }
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
                          type={question.multipleAnswers ? 'checkbox' : 'radio'}
                          name={`question-${selectedItem.chapterIndex}-${questionIndex}`}
                          checked={question.correctOption?.includes(optionIndex)}
                          onChange={() =>
                            handleCorrectOptionChange(
                              selectedItem.chapterIndex,
                              questionIndex,
                              optionIndex,
                              question.multipleAnswers
                            )
                          }
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(
                              selectedItem.chapterIndex,
                              questionIndex,
                              optionIndex,
                              e.target.value
                            )
                          }
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
                      onChange={(e) =>
                        handleQuestionChange(
                          selectedItem.chapterIndex,
                          questionIndex,
                          'explanation',
                          e.target.value
                        )
                      }
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
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'En cours...' : initialData ? 'Mettre à jour le cours' : 'Créer le cours'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CourseEditor;