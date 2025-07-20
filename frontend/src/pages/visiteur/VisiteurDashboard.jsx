import React from 'react';
import { Link } from 'react-router-dom';

const VisiteurDashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">Tableau de bord Étudiant</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Bonjour, {user.prenom}</span>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Vos cours</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((course) => (
              <div key={course} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="bg-gray-200 h-40 flex items-center justify-center">
                  <span className="text-gray-500">Image du cours {course}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1">Titre du cours {course}</h3>
                  <p className="text-gray-600 text-sm mb-2">Description courte du cours...</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Progression: {course * 25}%</span>
                    <Link 
                      to={`/cours/${course}`}
                      className="text-sm bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      Continuer
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">Vos informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Nom complet:</p>
              <p className="font-medium">{user.prenom} {user.nom}</p>
            </div>
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Date d'inscription:</p>
              <p className="font-medium">
                {new Date(user.createdAt || new Date()).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Rôle:</p>
              <p className="font-medium capitalize">Étudiant</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisiteurDashboard;