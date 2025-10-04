import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import { leaderboardService } from '../../services/api';

const Leaderboard = () => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewType, setViewType] = useState('client'); // 'client' or 'global'

  useEffect(() => {
    loadLeaderboard();
  }, [viewType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (user.role === 'root_admin' || viewType === 'global') {
        data = await leaderboardService.getGlobalRanking();
      } else {
        data = await leaderboardService.getClientRanking();
      }
      setRankings(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRowStyle = (rank, isCurrentUser) => {
    let baseStyle = 'hover:bg-gray-50 transition-colors';
    
    if (isCurrentUser) {
      baseStyle += ' bg-blue-50 font-semibold border-l-4 border-blue-500';
    }
    
    if (rank === 1) {
      return baseStyle + ' bg-gradient-to-r from-yellow-50 to-yellow-100';
    } else if (rank === 2) {
      return baseStyle + ' bg-gradient-to-r from-gray-50 to-gray-100';
    } else if (rank === 3) {
      return baseStyle + ' bg-gradient-to-r from-orange-50 to-orange-100';
    }
    
    return baseStyle;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">⚽</div>
          <div className="text-xl text-gray-600">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
          🏆 Leaderboard
        </h1>
        
        {user.role !== 'root_admin' && user.client && (
          <div className="flex gap-2 bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setViewType('client')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewType === 'client'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Client
            </button>
            <button
              onClick={() => setViewType('global')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewType === 'global'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Global
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <Card>
        {rankings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-xl text-gray-600">No rankings available yet</p>
            <p className="text-gray-500 mt-2">Start making predictions to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <th className="text-left py-4 px-4 rounded-tl-lg">Rank</th>
                  <th className="text-left py-4 px-4">Player</th>
                  <th className="text-right py-4 px-4">Points</th>
                  <th className="text-right py-4 px-4">Total Bets</th>
                  <th className="text-right py-4 px-4">Winning Bets</th>
                  <th className="text-right py-4 px-4 rounded-tr-lg">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankings.map((entry) => {
                  const isCurrentUser = entry.user.id === user.id;
                  return (
                    <tr 
                      key={entry.rank} 
                      className={getRowStyle(entry.rank, isCurrentUser)}
                    >
                      <td className="py-4 px-4">
                        <span className="text-2xl font-bold">
                          {getMedalEmoji(entry.rank)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={isCurrentUser ? 'text-blue-700' : 'text-gray-900'}>
                            {entry.user.username}
                          </span>
                          {isCurrentUser && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {entry.user.points}
                        </span>
                      </td>
                      <td className="text-right py-4 px-4 text-gray-700">
                        {entry.total_bets}
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className="text-green-600 font-semibold">
                          {entry.winning_bets}
                        </span>
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className={`px-3 py-1 rounded-full font-semibold ${
                          entry.accuracy >= 70 
                            ? 'bg-green-100 text-green-800' 
                            : entry.accuracy >= 40 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.accuracy.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Statistics Summary */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-center">
              <div className="text-5xl mb-2">👥</div>
              <div className="text-3xl font-bold">{rankings.length}</div>
              <div className="text-blue-100">Total Players</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-center">
              <div className="text-5xl mb-2">🎯</div>
              <div className="text-3xl font-bold">
                {rankings.reduce((sum, r) => sum + r.total_bets, 0)}
              </div>
              <div className="text-purple-100">Total Predictions</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-center">
              <div className="text-5xl mb-2">✅</div>
              <div className="text-3xl font-bold">
                {rankings.reduce((sum, r) => sum + r.winning_bets, 0)}
              </div>
              <div className="text-green-100">Winning Predictions</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
