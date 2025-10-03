import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageClients from './components/admin/ManageClients';
import ManageMatches from './components/admin/ManageMatches';
import ClientDashboard from './components/client/ClientDashboard';
import PredictMatch from './components/client/PredictMatch';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Navbar />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <AdminDashboard /> : <ClientDashboard />}
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageClients />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/matches"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageMatches />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/predict/:matchId"
            element={
              <ProtectedRoute>
                <PredictMatch />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

