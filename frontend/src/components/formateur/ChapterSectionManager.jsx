import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiX, FiSave } from 'react-icons/fi';
import api from '../../services/api';

const ChapterSectionManager = ({ course, onUpdate }) => {
  const [chapters, setChapters] = useState([]);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [newChapter, setNewChapter] = useState({ title: '', order: '' });
  const [newSection, setNewSection] = useState({ 
    title: '', 
    content: '', 
    videoUrl: '', 
    order: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (course && course.chapters) {
      setChapters([...course.chapters].sort((a, b) => a.order - b.order));
    }
  }, [course]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleAddChapter = async () => {
    if (!newChapter.title) {
      setError('Le titre du chapitre est requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const order = newChapter.order || chapters.length + 1;
      const response = await api.post(`/courses/${course._id}/chapters`, {
        title: newChapter.title,
        order: parseInt(order)
      });

      const updatedChapters = [...chapters, response.data.data];
      setChapters(updatedChapters);
      setNewChapter({ title: '', order: '' });
      onUpdate(); // Refresh course data
    } catch (err) {
      console.error('Error adding chapter:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout du chapitre');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChapter = async () => {
    if (!editingChapter.title) {
      setError('Le titre du chapitre est requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.put(`/courses/${course._id}/chapters/${editingChapter._id}`, {
        title: editingChapter.title,
        order: parseInt(editingChapter.order)
      });

      const updatedChapters = chapters.map(ch => 
        ch._id === editingChapter._id ? { ...ch, ...editingChapter } : ch
      );
      setChapters(updatedChapters);
      setEditingChapter(null);
      onUpdate(); // Refresh course data
    } catch (err) {
      console.error('Error updating chapter:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du chapitre');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce chapitre et toutes ses sections?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/courses/${course._id}/chapters/${chapterId}`);
      
      const updatedChapters = chapters.filter(ch => ch._id !== chapterId);
      setChapters(updatedChapters);
      onUpdate(); // Refresh course data
    } catch (err) {
      console.error('Error deleting chapter:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression du chapitre');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (chapterId) => {
    if (!newSection.title) {
      setError('Le titre de la section est requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const order = newSection.order || 
        (chapters.find(ch => ch._id === chapterId)?.sections?.length || 0) + 1;
      
      const response = await api.post(`/courses/${course._id}/chapters/${chapterId}/sections`, {
        title: newSection.title,
        content: newSection.content,
        videoUrl: newSection.videoUrl,
        order: parseInt(order)
      });

      const updatedChapters = chapters.map(chapter => {
        if (chapter._id === chapterId) {
          return {
            ...chapter,
            sections: [...(chapter.sections || []), response.data.data]
          };
        }
        return chapter;
      });

      setChapters(updatedChapters);
      setNewSection({ title: '', content: '', videoUrl: '', order: '' });
      onUpdate(); // Refresh course data
    } catch (err) {
      console.error('Error adding section:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout de la section');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = async (chapterId) => {
    if (!editingSection.title) {
      setError('Le titre de la section est requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.put(
        `/courses/${course._id}/chapters/${chapterId}/sections/${editingSection._id}`,
        {
          title: editingSection.title,
          content: editingSection.content,
          videoUrl: editingSection.videoUrl,
          order: parseInt(editingSection.order)
        }
      );

      const updatedChapters = chapters.map(chapter => {
        if (chapter._id === chapterId) {
          return {
            ...chapter,
            sections: chapter.sections.map(sec => 
              sec._id === editingSection._id ? { ...sec, ...editingSection } : sec
            )
          };
        }
        return chapter;
      });

      setChapters(updatedChapters);
      setEditingSection(null);
      onUpdate(); // Refresh course data
    } catch (err) {
      console.error('Error updating section:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de la section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (chapterId, sectionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette section?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/courses/${course._id}/chapters/${chapterId}/sections/${sectionId}`);
      
      const updatedChapters = chapters.map(chapter => {
        if (chapter._id === chapterId) {
          return {
            ...chapter,
            sections: chapter.sections.filter(sec => sec._id !== sectionId)
          };
        }
        return chapter;
      });

      setChapters(updatedChapters);
      onUpdate(); // Refresh course data
    } catch (err) {
      console.error('Error deleting section:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression de la section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestion des Chapitres et Sections</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Add New Chapter Form */}
      <div className="mb-8 p-4 border rounded-md bg-gray-50">
        <h3 className="font-medium mb-3">Ajouter un nouveau chapitre</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du chapitre *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              value={newChapter.title}
              onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
              placeholder="Introduction au cours"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordre
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md"
              value={newChapter.order}
              onChange={(e) => setNewChapter({...newChapter, order: e.target.value})}
              placeholder="1"
              min="1"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleAddChapter}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? 'En cours...' : (
              <>
                <FiPlus className="mr-2" />
                Ajouter le chapitre
              </>
            )}
          </button>
        </div>
      </div>

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun chapitre dans ce cours
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter._id} className="border rounded-md overflow-hidden">
              {/* Chapter Header */}
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <div className="flex items-center">
                  {editingChapter?._id === chapter._id ? (
                    <input
                      type="text"
                      className="w-full px-2 py-1 border rounded mr-2"
                      value={editingChapter.title}
                      onChange={(e) => setEditingChapter({
                        ...editingChapter,
                        title: e.target.value
                      })}
                    />
                  ) : (
                    <span className="font-medium mr-3">{chapter.order}.</span>
                  )}
                  
                  {editingChapter?._id === chapter._id ? (
                    <input
                      type="number"
                      className="w-16 px-2 py-1 border rounded"
                      value={editingChapter.order}
                      onChange={(e) => setEditingChapter({
                        ...editingChapter,
                        order: e.target.value
                      })}
                      min="1"
                    />
                  ) : (
                    <h3 className="font-medium">{chapter.title}</h3>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {chapter.sections?.length || 0} sections
                  </span>
                  
                  <button
                    onClick={() => toggleChapter(chapter._id)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    {expandedChapters[chapter._id] ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  
                  {editingChapter?._id === chapter._id ? (
                    <>
                      <button
                        onClick={() => handleUpdateChapter()}
                        disabled={loading}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Enregistrer"
                      >
                        <FiSave />
                      </button>
                      <button
                        onClick={() => setEditingChapter(null)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        title="Annuler"
                      >
                        <FiX />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingChapter({...chapter})}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Modifier"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter._id)}
                        disabled={loading}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Expanded Chapter Content */}
              {expandedChapters[chapter._id] && (
                <div className="p-4 border-t">
                  {/* Add New Section Form */}
                  <div className="mb-6 p-3 border rounded-md bg-gray-50">
                    <h4 className="font-medium mb-2">
                      {editingSection ? 'Modifier la section' : 'Ajouter une nouvelle section'}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre de la section *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          value={editingSection?.title || newSection.title}
                          onChange={(e) => 
                            editingSection 
                              ? setEditingSection({...editingSection, title: e.target.value})
                              : setNewSection({...newSection, title: e.target.value})
                          }
                          placeholder="Introduction au chapitre"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contenu
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border rounded-md"
                          rows="3"
                          value={editingSection?.content || newSection.content}
                          onChange={(e) => 
                            editingSection 
                              ? setEditingSection({...editingSection, content: e.target.value})
                              : setNewSection({...newSection, content: e.target.value})
                          }
                          placeholder="Contenu détaillé de la section..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL de la vidéo
                          </label>
                          <input
                            type="url"
                            className="w-full px-3 py-2 border rounded-md"
                            value={editingSection?.videoUrl || newSection.videoUrl}
                            onChange={(e) => 
                              editingSection 
                                ? setEditingSection({...editingSection, videoUrl: e.target.value})
                                : setNewSection({...newSection, videoUrl: e.target.value})
                            }
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ordre
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border rounded-md"
                            value={editingSection?.order || newSection.order}
                            onChange={(e) => 
                              editingSection 
                                ? setEditingSection({...editingSection, order: e.target.value})
                                : setNewSection({...newSection, order: e.target.value})
                            }
                            placeholder="1"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end space-x-2">
                      {editingSection && (
                        <button
                          onClick={() => setEditingSection(null)}
                          className="px-3 py-1 border rounded-md hover:bg-gray-100 transition"
                        >
                          Annuler
                        </button>
                      )}
                      <button
                        onClick={() => 
                          editingSection 
                            ? handleUpdateSection(chapter._id)
                            : handleAddSection(chapter._id)
                        }
                        disabled={loading}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        {loading ? 'En cours...' : (
                          <>
                            <FiPlus className="mr-1" />
                            {editingSection ? 'Enregistrer' : 'Ajouter'} la section
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Sections List */}
                  {chapter.sections && chapter.sections.length > 0 ? (
                    <div className="space-y-3">
                      {chapter.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                          <div key={section._id} className="pl-6 py-3 border-b last:border-b-0">
                            {editingSection?._id === section._id ? (
                              <div className="p-3 bg-blue-50 rounded-md">
                                {/* Editing form is shown in the Add Section area */}
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{section.title}</h4>
                                  {section.content && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {section.content}
                                    </p>
                                  )}
                                  {section.videoUrl && (
                                    <div className="mt-2">
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Contient une vidéo
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setEditingSection({...section})}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Modifier"
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSection(chapter._id, section._id)}
                                    disabled={loading}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Supprimer"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Aucune section dans ce chapitre
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChapterSectionManager;