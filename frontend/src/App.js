import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageClients from './components/admin/ManageClients';
import ManageUsers from './components/admin/ManageUsers';
import ManageMatches from './components/admin/ManageMatches';
import ClientDashboard from './components/client/ClientDashboard';
import PredictMatch from './components/client/PredictMatch';
import Leaderboard from './components/client/Leaderboard';
import AllMatches from './components/client/AllMatches';
import MyPredictions from './components/client/MyPredictions';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {user && <Navbar />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {user?.role === 'root_admin' ? <AdminDashboard /> : <ClientDashboard />}
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute allowedRoles={['root_admin']}>
                <ManageClients />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['root_admin', 'client_admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['client_admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/matches"
            element={
              <ProtectedRoute allowedRoles={['root_admin']}>
                <ManageMatches />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/leaderboard"
            element={
              <ProtectedRoute allowedRoles={['root_admin']}>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute allowedRoles={['client_admin', 'user']}>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/predict/:matchId"
            element={
              <ProtectedRoute allowedRoles={['client_admin', 'user']}>
                <PredictMatch />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/matches"
            element={
              <ProtectedRoute allowedRoles={['client_admin', 'user']}>
                <AllMatches />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/my-bets"
            element={
              <ProtectedRoute allowedRoles={['client_admin', 'user']}>
                <MyPredictions />
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
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;