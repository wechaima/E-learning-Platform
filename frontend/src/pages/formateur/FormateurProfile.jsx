import React from 'react';
import { UserCircleIcon, EnvelopeIcon, AcademicCapIcon, ShieldCheckIcon } from '@heroicons/react/outline';

const FormateurProfile = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Mon Profil</h1>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <UserCircleIcon className="h-12 w-12 text-indigo-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{user.prenom} {user.nom}</h2>
                <p className="text-gray-600">Formateur</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <EnvelopeIcon className="h-12 w-12 text-indigo-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Email</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <AcademicCapIcon className="h-12 w-12 text-indigo-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Spécialité</h2>
                <p className="text-gray-600">{user.specialite || 'Non spécifié'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ShieldCheckIcon className="h-12 w-12 text-indigo-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Rôle</h2>
                <p className="text-gray-600 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormateurProfile;