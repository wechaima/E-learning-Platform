import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import FormateurDashboard from './pages/formateur/FormateurDashboard';

import { Navigate } from 'react-router-dom';
import EtudiantDashboard from './pages/etudiant/EtudiantDashboard';

import { ForgotPassword } from './pages/ForgotPassword';
import CourseDetail from './pages/etudiant/CourseDetail';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app min-h-screen bg-gray-50">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
           
            {/* Routes protégées */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
  <Route path="/admin/*" element={<AdminDashboard />} />
</Route>


            <Route element={<ProtectedRoute allowedRoles={['formateur']} />}>
              <Route path="/formateur/*" element={<FormateurDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['etudiant']} />}>
  <Route path="/etudiant/*" element={<EtudiantDashboard />} />
</Route>
<Route path="/cours/:id" element={<CourseDetail  />} />
            {/* Gestion des routes inconnues */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;