import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rankings from './pages/Rankings';
import Profile from './pages/Profile';
import RootAdminPanel from './pages/admin/RootAdminPanel';
import ClientAdminPanel from './pages/admin/ClientAdminPanel';
import './index.css';

function AppContent() {
  const location = useLocation();
  const showNav = location.pathname !== '/login';

  return (
    <>
      {showNav && <Navigation />}
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/rankings"
          element={
            <PrivateRoute>
              <Rankings />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['root_admin']}>
              <RootAdminPanel />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/company-admin"
          element={
            <PrivateRoute allowedRoles={['client_admin']}>
              <ClientAdminPanel />
            </PrivateRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
                <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
