import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { statisticsService } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Root Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage clients, users, and matches</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">👥</div>
          <div className="text-4xl font-bold mb-1">{stats?.total_users || 0}</div>
          <div className="text-blue-100 text-lg">Total Users</div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">🏢</div>
          <div className="text-4xl font-bold mb-1">{stats?.total_clients || 0}</div>
          <div className="text-green-100 text-lg">Active Clients</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">⚽</div>
          <div className="text-4xl font-bold mb-1">{stats?.total_matches || 0}</div>
          <div className="text-purple-100 text-lg">Total Matches</div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">🎯</div>
          <div className="text-4xl font-bold mb-1">{stats?.total_bets || 0}</div>
          <div className="text-yellow-100 text-lg">Total Bets</div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">📅</div>
          <div className="text-4xl font-bold mb-1">{stats?.upcoming_matches || 0}</div>
          <div className="text-red-100 text-lg">Upcoming Matches</div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-3">✅</div>
          <div className="text-4xl font-bold mb-1">{stats?.finished_matches || 0}</div>
          <div className="text-indigo-100 text-lg">Finished Matches</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/clients">
          <Card className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-blue-300">
            <div className="text-5xl mb-3">🏢</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Manage Clients</h3>
            <p className="text-gray-600">Add, edit, and manage client organizations</p>
          </Card>
        </Link>

        <Link to="/admin/users">
          <Card className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-green-300">
            <div className="text-5xl mb-3">👥</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Manage Users</h3>
            <p className="text-gray-600">Create and manage user accounts</p>
          </Card>
        </Link>

        <Link to="/admin/matches">
          <Card className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-purple-300">
            <div className="text-5xl mb-3">⚽</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Manage Matches</h3>
            <p className="text-gray-600">Add matches and update results</p>
          </Card>
        </Link>

        <Link to="/admin/leaderboard">
          <Card className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-yellow-300">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Global Leaderboard</h3>
            <p className="text-gray-600">View global rankings and statistics</p>
          </Card>
        </Link>

        <Link to="/admin/bets">
          <Card className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-red-300">
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">View Bets</h3>
            <p className="text-gray-600">Monitor all user predictions</p>
          </Card>
        </Link>
      </div>

      {/* Note about Root Admin permissions */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500">
        <div className="flex items-start gap-3">
          <span className="text-3xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Root Admin Permissions</h3>
            <p className="text-gray-700 text-sm">
              As a Root Admin, you can manage clients, users, and matches, but you <strong>cannot make predictions</strong>. 
              This role is focused on customer service and system management.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
