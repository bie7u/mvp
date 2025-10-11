import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Leagues from './pages/Leagues';
import AccessDenied from './pages/AccessDenied';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={['root_admin', 'client_admin', 'client_user']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="analytics"
              element={
                <ProtectedRoute allowedRoles={['root_admin', 'client_admin', 'client_user']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['root_admin', 'client_admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['root_admin', 'client_admin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="clients"
              element={
                <ProtectedRoute allowedRoles={['root_admin']}>
                  <Clients />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="clients/:clientId"
              element={
                <ProtectedRoute allowedRoles={['root_admin']}>
                  <ClientDetail />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="leagues"
              element={
                <ProtectedRoute allowedRoles={['root_admin', 'client_admin', 'client_user']}>
                  <Leagues />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
