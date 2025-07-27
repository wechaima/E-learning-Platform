import React from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiBook } from 'react-icons/fi';

const CourseList = ({ courses, loading, onSelect, onCreate, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mes Cours</h1>
        <button
          onClick={onCreate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <FiPlus className="mr-2" />
          Créer un cours
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <FiBook className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500">Vous n'avez pas encore créé de cours</p>
          <button
            onClick={onCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Créer votre premier cours
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                {course.imageUrl ? (
                  <img 
                    src={course.imageUrl} 
                    alt={course.title} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FiBook className="text-4xl text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <FiUsers className="mr-1" />
                    {course.followersCount || 0} abonnés
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {course.category}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelect(course)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                  >
                    Voir détails
                  </button>
                  <button
                    onClick={() => onDelete(course._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                    title="Supprimer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;