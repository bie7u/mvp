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
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-bold">{stats?.total_users || 0}</div>
          <div className="text-blue-100">Total Users</div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-4xl mb-2">🏢</div>
          <div className="text-3xl font-bold">{stats?.total_clients || 0}</div>
          <div className="text-green-100">Active Clients</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-4xl mb-2">⚽</div>
          <div className="text-3xl font-bold">{stats?.total_matches || 0}</div>
          <div className="text-purple-100">Total Matches</div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-3xl font-bold">{stats?.total_bets || 0}</div>
          <div className="text-yellow-100">Total Bets</div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="text-4xl mb-2">📅</div>
          <div className="text-3xl font-bold">{stats?.upcoming_matches || 0}</div>
          <div className="text-red-100">Upcoming Matches</div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-bold">{stats?.finished_matches || 0}</div>
          <div className="text-indigo-100">Finished Matches</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/clients">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-4xl mb-2">🏢</div>
            <h3 className="text-xl font-semibold mb-2">Manage Clients</h3>
            <p className="text-gray-600">Add, edit, and manage client organizations</p>
          </Card>
        </Link>

        <Link to="/admin/users">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
            <p className="text-gray-600">Create and manage user accounts</p>
          </Card>
        </Link>

        <Link to="/admin/matches">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-4xl mb-2">⚽</div>
            <h3 className="text-xl font-semibold mb-2">Manage Matches</h3>
            <p className="text-gray-600">Add matches and update results</p>
          </Card>
        </Link>

        <Link to="/admin/leaderboard">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Global Leaderboard</h3>
            <p className="text-gray-600">View global rankings and statistics</p>
          </Card>
        </Link>

        <Link to="/admin/bets">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="text-xl font-semibold mb-2">View Bets</h3>
            <p className="text-gray-600">Monitor all user predictions</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
