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

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center text-xl font-bold text-primary">
              ⚽ Football Predictions
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-gray-700">
                  👤 {user.username}
                  {user.role === 'admin' && ' (Admin)'}
                  {user.role === 'client' && ' (Client)'}
                </span>
                <span className="text-gray-700">🏆 {user.points} pts</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
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
