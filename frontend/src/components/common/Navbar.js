import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'root_admin':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Root Admin</span>;
      case 'client_admin':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Client Admin</span>;
      case 'user':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">User</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all">
              ⚽ Football Predictions
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  👤 {user.username}
                  {getRoleBadge(user.role)}
                </span>
                {user.role !== 'root_admin' && (
                  <span className="text-gray-700 font-semibold">🏆 {user.points} pts</span>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
