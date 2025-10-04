import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { statisticsService } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await statisticsService.getOverview();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8 dark:text-gray-200">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {t('rootAdminDashboard')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('manageClientsUsersMatches')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">👥</div>
          <div className="text-4xl font-bold mb-1">{stats?.total_users || 0}</div>
          <div className="text-blue-100 text-lg">{t('totalUsers')}</div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">🏢</div>
          <div className="text-4xl font-bold mb-1">{stats?.total_clients || 0}</div>
          <div className="text-green-100 text-lg">{t('activeClients')}</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">⚽</div>
          <div className="text-4xl font-bold mb-1">{stats?.total_matches || 0}</div>
          <div className="text-purple-100 text-lg">{t('totalMatches')}</div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">🎯</div>
          <div className="text-4xl font-bold mb-1">{stats?.total_bets || 0}</div>
          <div className="text-yellow-100 text-lg">{t('totalBets')}</div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">📅</div>
          <div className="text-4xl font-bold mb-1">{stats?.upcoming_matches || 0}</div>
          <div className="text-red-100 text-lg">{t('upcomingMatches')}</div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">✅</div>
          <div className="text-4xl font-bold mb-1">{stats?.finished_matches || 0}</div>
          <div className="text-indigo-100 text-lg">{t('finishedMatches')}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/clients">
          <Card className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-500">
            <div className="text-5xl mb-3">🏢</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{t('manageClients')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('addEditManageClients')}</p>
          </Card>
        </Link>

        <Link to="/admin/users">
          <Card className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-green-300 dark:hover:border-green-500">
            <div className="text-5xl mb-3">👥</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{t('manageUsers')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('createManageUserAccounts')}</p>
          </Card>
        </Link>

        <Link to="/admin/matches">
          <Card className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-500">
            <div className="text-5xl mb-3">⚽</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{t('manageMatches')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('addMatchesUpdateResults')}</p>
          </Card>
        </Link>

        <Link to="/admin/leaderboard">
          <Card className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-yellow-300 dark:hover:border-yellow-500">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{t('globalLeaderboard')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('viewGlobalRankings')}</p>
          </Card>
        </Link>

        <Link to="/admin/bets">
          <Card className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-red-300 dark:hover:border-red-500">
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{t('viewBets')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('monitorAllPredictions')}</p>
          </Card>
        </Link>
      </div>

      {/* Note about Root Admin permissions */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500">
        <div className="flex items-start gap-3">
          <span className="text-3xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">{t('rootAdminPermissions')}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {t('rootAdminPermissionsDesc')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
