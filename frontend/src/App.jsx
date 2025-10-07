import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layout
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Employee Pages
import Dashboard from './pages/Dashboard';
import Predictions from './pages/Predictions';
import Rankings from './pages/Rankings';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CompanyManagement from './pages/admin/CompanyManagement';
import UserManagement from './pages/admin/UserManagement';
import LeagueManagement from './pages/admin/LeagueManagement';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false, rootAdminOnly = false }) {
  const { isAuthenticated, isRootAdmin, isClientAdmin } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (rootAdminOnly && !isRootAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (adminOnly && !isRootAdmin() && !isClientAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="rankings" element={<Rankings />} />
        <Route path="profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/companies" element={
          <ProtectedRoute rootAdminOnly>
            <CompanyManagement />
          </ProtectedRoute>
        } />
        <Route path="admin/users" element={
          <ProtectedRoute adminOnly>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="admin/leagues" element={
          <ProtectedRoute rootAdminOnly>
            <LeagueManagement />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
