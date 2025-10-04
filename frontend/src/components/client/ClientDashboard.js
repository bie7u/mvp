import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { matchService, betService, leaderboardService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
    return <div className="text-center p-8 dark:text-gray-200">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('dashboard')}
        </h1>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('yourPoints')}</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">🏆 {user.points}</div>
        </div>
      </div>

      {/* Client Admin Quick Actions */}
      {user.role === 'client_admin' && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">👥 {t('clientAdmin')}</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {t('youCanManageUsers')}
              </p>
            </div>
            <Link
              to="/users"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
            >
              {t('manageUsers')}
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Matches */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">⚽ {t('upcomingMatchesTitle')}</h2>
          </div>
          {upcomingMatches.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('noUpcomingMatches')}</p>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {match.home_team} <span className="text-gray-400">{t('vs')}</span> {match.away_team}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        📅 {new Date(match.match_date).toLocaleDateString()} - {match.league}
                      </div>
                    </div>
                    <Link
                      to={`/predict/${match.id}`}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      {t('predict')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/matches"
            className="block mt-4 text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold hover:underline"
          >
            {t('viewAllMatches')} →
          </Link>
        </Card>

        {/* My Recent Bets */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">🎯 {t('myRecentPredictions')}</h2>
          </div>
          {myBets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-gray-500 dark:text-gray-400">{t('noPredictions')}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{t('startPredicting')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBets.map((bet) => (
                <div
                  key={bet.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {bet.match_details.home_team} {t('vs')} {bet.match_details.away_team}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('yourPrediction')}: <span className="font-bold text-blue-600 dark:text-blue-400">{bet.predicted_home_score} - {bet.predicted_away_score}</span>
                  </div>
                  <div className="text-sm mt-2">
                    {bet.is_processed ? (
                      <span className={`px-3 py-1 rounded-full font-semibold ${
                        bet.points_earned > 0 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {bet.points_earned > 0 ? `+${bet.points_earned}` : bet.points_earned} {t('points')}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 font-semibold">
                        ⏳ {t('pending')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/my-bets"
            className="block mt-4 text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold hover:underline"
          >
            {t('viewAllPredictions')} →
          </Link>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">🏆 {t('topPlayers')}</h2>
        </div>
        {ranking.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('noRankings')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('rank')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('player')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('points')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('accuracy')}</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((entry) => (
                  <tr key={entry.rank} className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-xl font-bold">
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                        {entry.rank > 3 && `#${entry.rank}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{entry.user.username}</td>
                    <td className="text-right py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{entry.user.points}</td>
                    <td className="text-right py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        entry.accuracy >= 70 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : entry.accuracy >= 40 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
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
          {t('viewFullLeaderboard')} →
        </Link>
      </Card>
    </div>
  );
};

export default ClientDashboard;
