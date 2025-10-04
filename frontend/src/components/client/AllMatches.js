import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { matchService } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

const AllMatches = () => {
  const { t } = useLanguage();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [selectedRound, setSelectedRound] = useState('all');
  const [leagues, setLeagues] = useState([]);
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        league: selectedLeague,
        round: selectedRound,
      };
      const filteredMatches = await matchService.getMatches(filters);
      setMatches(filteredMatches);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLeague, selectedRound]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const loadInitialData = async () => {
    try {
      // Load all matches to get leagues and rounds options
      const allMatches = await matchService.getMatches();
      
      // Extract unique leagues and rounds
      const uniqueLeagues = [...new Set(allMatches.map(m => m.league))].filter(Boolean).sort();
      const uniqueRounds = [...new Set(allMatches.map(m => m.round))].filter(Boolean).sort();
      
      setLeagues(uniqueLeagues);
      setRounds(uniqueRounds);
      setMatches(allMatches);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isMatchFinished = (match) => {
    return match.home_score !== null && match.away_score !== null;
  };

  const isMatchUpcoming = (match) => {
    return new Date(match.match_date) > new Date() && !isMatchFinished(match);
  };

  if (loading) {
    return <div className="text-center p-8 dark:text-gray-200">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ⚽ {t('allMatches')}
        </h1>
        
        {/* Filters Section */}
        <div className="space-y-4">
          {/* League Filter */}
          {leagues.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('filterByLeague') || 'Filter by League'}:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLeague('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedLeague === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('allLeagues')}
                </button>
                {leagues.map(league => (
                  <button
                    key={league}
                    onClick={() => setSelectedLeague(league)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedLeague === league
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {league}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Round Filter */}
          {rounds.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('filterByRound') || 'Filter by Round'}:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRound('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedRound === 'all'
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('allRounds') || 'All Rounds'}
                </button>
                {rounds.map(round => (
                  <button
                    key={round}
                    onClick={() => setSelectedRound(round)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedRound === round
                        ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {round}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {matches.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚽</div>
            <p className="text-xl text-gray-600 dark:text-gray-400">{t('noMatches')}</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Upcoming Matches */}
          {matches.filter(isMatchUpcoming).length > 0 && (
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                📅 {t('upcomingMatchesTitle')}
              </h2>
              <div className="space-y-3">
                {matches.filter(isMatchUpcoming).map((match) => (
                  <div
                    key={match.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1 w-full">
                        <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {match.home_team} <span className="text-gray-400">{t('vs')}</span> {match.away_team}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            📅 {new Date(match.match_date).toLocaleDateString()} {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            🏆 {match.league}
                          </span>
                          {match.round && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              🎯 {match.round}
                            </span>
                          )}
                          {match.venue && (
                            <span className="text-purple-600 dark:text-purple-400">
                              📍 {match.venue}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/predict/${match.id}`}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all whitespace-nowrap"
                      >
                        {t('predict')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Finished Matches */}
          {matches.filter(isMatchFinished).length > 0 && (
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                ✅ {t('finishedMatches')}
              </h2>
              <div className="space-y-3">
                {matches.filter(isMatchFinished).map((match) => (
                  <div
                    key={match.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1 w-full">
                        <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {match.home_team} <span className="text-gray-400">{t('vs')}</span> {match.away_team}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            📅 {new Date(match.match_date).toLocaleDateString()}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            🏆 {match.league}
                          </span>
                          {match.round && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              🎯 {match.round}
                            </span>
                          )}
                          {match.venue && (
                            <span className="text-purple-600 dark:text-purple-400">
                              📍 {match.venue}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('finalScore')}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {match.home_score} - {match.away_score}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AllMatches;
