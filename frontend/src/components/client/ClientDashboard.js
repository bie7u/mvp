import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { matchService, betService, leaderboardService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [myBets, setMyBets] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [matches, bets, leaderboard] = await Promise.all([
        matchService.getUpcomingMatches(),
        betService.getMyBets(),
        leaderboardService.getClientRanking(),
      ]);
      setUpcomingMatches(matches.slice(0, 5));
      setMyBets(bets.slice(0, 5));
      setRanking(leaderboard.slice(0, 5));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">Your Points</div>
          <div className="text-3xl font-bold text-blue-600">🏆 {user.points}</div>
        </div>
      </div>

      {/* Client Admin Quick Actions */}
      {user.role === 'client_admin' && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">👥 Client Admin</h3>
              <p className="text-gray-700 text-sm">
                You can manage users for your company
              </p>
            </div>
            <Link
              to="/users"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Manage Users
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Matches */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">⚽ Upcoming Matches</h2>
          </div>
          {upcomingMatches.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming matches</p>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {match.home_team} <span className="text-gray-400">vs</span> {match.away_team}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        📅 {new Date(match.match_date).toLocaleDateString()} - {match.league}
                      </div>
                    </div>
                    <Link
                      to={`/predict/${match.id}`}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      Predict
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/matches"
            className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            View All Matches →
          </Link>
        </Card>

        {/* My Recent Bets */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🎯 My Recent Predictions</h2>
          </div>
          {myBets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-gray-500">No predictions yet</p>
              <p className="text-sm text-gray-400 mt-2">Start predicting to earn points!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBets.map((bet) => (
                <div
                  key={bet.id}
                  className="border-2 border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-semibold text-gray-900">
                    {bet.match_details.home_team} vs {bet.match_details.away_team}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Your prediction: <span className="font-bold text-blue-600">{bet.predicted_home_score} - {bet.predicted_away_score}</span>
                  </div>
                  <div className="text-sm mt-2">
                    {bet.is_processed ? (
                      <span className={`px-3 py-1 rounded-full font-semibold ${
                        bet.points_earned > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {bet.points_earned > 0 ? `+${bet.points_earned}` : bet.points_earned} points
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/my-bets"
            className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            View All Predictions →
          </Link>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">🏆 Top Players</h2>
        </div>
        {ranking.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No rankings available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Player</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Points</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((entry) => (
                  <tr key={entry.rank} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-xl font-bold">
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                        {entry.rank > 3 && `#${entry.rank}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{entry.user.username}</td>
                    <td className="text-right py-3 px-4 font-bold text-blue-600">{entry.user.points}</td>
                    <td className="text-right py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
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
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link
          to="/leaderboard"
          className="block mt-4 py-3 text-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all"
        >
          View Full Leaderboard →
        </Link>
      </Card>
    </div>
  );
};

export default ClientDashboard;
