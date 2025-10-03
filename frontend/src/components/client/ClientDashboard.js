import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { matchService, betService, leaderboardService } from '../../services/api';

const ClientDashboard = () => {
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
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Matches */}
        <Card title="⚽ Upcoming Matches">
          {upcomingMatches.length === 0 ? (
            <p className="text-gray-500">No upcoming matches</p>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="border-b pb-3 last:border-b-0 hover:bg-gray-50 p-2 rounded"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold">{match.home_team} vs {match.away_team}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(match.match_date).toLocaleDateString()} - {match.league}
                      </div>
                    </div>
                    <Link
                      to={`/predict/${match.id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
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
            className="block mt-4 text-center text-blue-500 hover:text-blue-600 font-semibold"
          >
            View All Matches →
          </Link>
        </Card>

        {/* My Recent Bets */}
        <Card title="🎯 My Recent Predictions">
          {myBets.length === 0 ? (
            <p className="text-gray-500">No predictions yet</p>
          ) : (
            <div className="space-y-3">
              {myBets.map((bet) => (
                <div
                  key={bet.id}
                  className="border-b pb-3 last:border-b-0 p-2 rounded hover:bg-gray-50"
                >
                  <div className="font-semibold">
                    {bet.match_details.home_team} vs {bet.match_details.away_team}
                  </div>
                  <div className="text-sm text-gray-600">
                    Prediction: {bet.predicted_home_score} - {bet.predicted_away_score}
                  </div>
                  <div className="text-sm">
                    {bet.is_processed ? (
                      <span className="text-green-600 font-semibold">
                        Points: {bet.points_earned}
                      </span>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/my-bets"
            className="block mt-4 text-center text-blue-500 hover:text-blue-600 font-semibold"
          >
            View All Predictions →
          </Link>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card title="🏆 Top Players">
        {ranking.length === 0 ? (
          <p className="text-gray-500">No rankings available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-left py-2">Player</th>
                  <th className="text-right py-2">Points</th>
                  <th className="text-right py-2">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((entry) => (
                  <tr key={entry.rank} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-2">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && `#${entry.rank}`}
                    </td>
                    <td className="py-2">{entry.user.username}</td>
                    <td className="text-right py-2 font-semibold">{entry.user.points}</td>
                    <td className="text-right py-2">{entry.accuracy.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link
          to="/leaderboard"
          className="block mt-4 text-center text-blue-500 hover:text-blue-600 font-semibold"
        >
          View Full Leaderboard →
        </Link>
      </Card>
    </div>
  );
};

export default ClientDashboard;
