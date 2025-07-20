import React from 'react';
import { Link } from 'react-router-dom';

const FormateurDashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">Tableau de bord Formateur</h1>
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
          <h2 className="text-xl font-semibold mb-6">Vos actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/formateur/cours"
              className="bg-indigo-50 p-6 rounded-lg hover:shadow-md transition"
            >
              <h3 className="text-lg font-medium text-indigo-800 mb-2">Gérer les cours</h3>
              <p className="text-gray-600">Créer, modifier ou supprimer des cours</p>
            </Link>
            
            <Link 
              to="/formateur/chapitres"
              className="bg-green-50 p-6 rounded-lg hover:shadow-md transition"
            >
              <h3 className="text-lg font-medium text-green-800 mb-2">Gérer les chapitres</h3>
              <p className="text-gray-600">Organiser le contenu de vos cours</p>
            </Link>
            
            <Link 
              to="/formateur/quiz"
              className="bg-purple-50 p-6 rounded-lg hover:shadow-md transition"
            >
              <h3 className="text-lg font-medium text-purple-800 mb-2">Créer des quiz</h3>
              <p className="text-gray-600">Évaluer les connaissances des étudiants</p>
            </Link>
            
            <Link 
              to="/formateur/scores"
              className="bg-yellow-50 p-6 rounded-lg hover:shadow-md transition"
            >
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Voir les scores</h3>
              <p className="text-gray-600">Consulter les résultats des étudiants</p>
            </Link>
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
              <p className="text-gray-600">Spécialité:</p>
              <p className="font-medium">{user.specialite}</p>
            </div>
            <div>
              <p className="text-gray-600">Rôle:</p>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FormateurDashboard;