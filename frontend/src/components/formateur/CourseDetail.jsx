import React, { useState } from 'react';
import { FiArrowLeft, FiEdit, FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../../services/api';

const CourseDetail = ({ course, onBack, onEdit }) => {
  const [expandedChapters, setExpandedChapters] = useState({});
  const [loading, setLoading] = useState(false);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce chapitre?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/courses/${course._id}/chapters/${chapterId}`);
      // Refresh course data
      const response = await api.get(`/courses/${course._id}`);
      onEdit(response.data.data);
    } catch (error) {
      console.error('Error deleting chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FiArrowLeft className="mr-1" />
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex-1">{course.title}</h1>
        <button
          onClick={onEdit}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <FiEdit className="mr-2" />
          Modifier
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-4 md:mb-0 md:pr-6">
            <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
              {course.imageUrl ? (
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <FiBook className="text-4xl text-gray-400" />
              )}
            </div>
          </div>
          <div className="md:w-2/3">
            <h2 className="text-xl font-semibold mb-2">Description du cours</h2>
            <p className="text-gray-700 mb-4">{course.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                <p className="font-medium">{course.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Abonnés</h3>
                <p className="font-medium">{course.followersCount || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                <p className="font-medium">
                  {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dernière mise à jour</h3>
                <p className="font-medium">
                  {new Date(course.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Chapitres</h2>
          <button className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">
            <FiPlus className="mr-1" />
            Ajouter un chapitre
          </button>
        </div>

        {course.chapters && course.chapters.length > 0 ? (
          <div className="space-y-3">
            {course.chapters.map((chapter) => (
              <div key={chapter._id} className="border rounded-md overflow-hidden">
                <div 
                  className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                  onClick={() => toggleChapter(chapter._id)}
                >
                  <div className="flex items-center">
                    <span className="font-medium mr-3">{chapter.order}.</span>
                    <h3 className="font-medium">{chapter.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {chapter.sections?.length || 0} sections
                    </span>
                    {expandedChapters[chapter._id] ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>
                
                {expandedChapters[chapter._id] && (
                  <div className="p-4 border-t">
                    {chapter.sections && chapter.sections.length > 0 ? (
                      <div className="space-y-3">
                        {chapter.sections.map((section) => (
                          <div key={section._id} className="pl-8 py-2 border-b last:border-b-0">
                            <h4 className="font-medium">{section.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {section.content?.substring(0, 100)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Aucune section dans ce chapitre</p>
                    )}
                    
                    <div className="flex justify-end mt-4 space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">
                        <FiPlus className="inline mr-1" />
                        Ajouter une section
                      </button>
                      <button className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition text-sm">
                        <FiEdit className="inline mr-1" />
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteChapter(chapter._id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                      >
                        <FiTrash2 className="inline mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucun chapitre dans ce cours
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;