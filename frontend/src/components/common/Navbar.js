import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const roleNames = {
      root_admin: t('rootAdmin'),
      client_admin: t('clientAdmin'),
      user: t('user'),
    };
    
    switch (role) {
      case 'root_admin':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{roleNames.root_admin}</span>;
      case 'client_admin':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{roleNames.client_admin}</span>;
      case 'user':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{roleNames.user}</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all">
              ⚽ {t('footballPredictions')}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-gray-700 dark:text-gray-200"
                  title={language === 'en' ? 'Przełącz na polski' : 'Switch to English'}
                >
                  {language === 'en' ? '🇵🇱 PL' : '🇬🇧 EN'}
                </button>
                <span className="text-gray-700 dark:text-gray-200 font-medium flex items-center gap-2">
                  👤 {user.username}
                  {getRoleBadge(user.role)}
                </span>
                {user.role !== 'root_admin' && (
                  <span className="text-gray-700 dark:text-gray-200 font-semibold">🏆 {user.points} {t('points')}</span>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {t('logout')}
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
