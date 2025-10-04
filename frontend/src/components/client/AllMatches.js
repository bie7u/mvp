import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { matchService } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

const AllMatches = () => {
  const { t } = useLanguage();
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [leagues, setLeagues] = useState([]);

  const filterMatches = useCallback(() => {
    if (selectedLeague === 'all') {
      setFilteredMatches(matches);
    } else {
      setFilteredMatches(matches.filter(m => m.league === selectedLeague));
    }
  }, [selectedLeague, matches]);

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [filterMatches]);

  const loadMatches = async () => {
    try {
      const [upcoming, recent] = await Promise.all([
        matchService.getUpcomingMatches(),
        matchService.getRecentMatches(),
      ]);
      const allMatches = [...upcoming, ...recent];
      setMatches(allMatches);
      
      // Extract unique leagues
      const uniqueLeagues = [...new Set(allMatches.map(m => m.league))].filter(Boolean).sort();
      setLeagues(uniqueLeagues);
    } catch (error) {
      console.error('Failed to load matches:', error);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ⚽ {t('allMatches')}
        </h1>
        
        {leagues.length > 0 && (
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
        )}
      </div>

      {filteredMatches.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚽</div>
            <p className="text-xl text-gray-600 dark:text-gray-400">{t('noMatches')}</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Upcoming Matches */}
          {filteredMatches.filter(isMatchUpcoming).length > 0 && (
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                📅 {t('upcomingMatchesTitle')}
              </h2>
              <div className="space-y-3">
                {filteredMatches.filter(isMatchUpcoming).map((match) => (
                  <div
                    key={match.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {match.home_team} <span className="text-gray-400">{t('vs')}</span> {match.away_team}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📅 {new Date(match.match_date).toLocaleDateString()} {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
                          🏆 {match.league}
                        </div>
                      </div>
                      <Link
                        to={`/predict/${match.id}`}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
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
          {filteredMatches.filter(isMatchFinished).length > 0 && (
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                ✅ {t('finishedMatches')}
              </h2>
              <div className="space-y-3">
                {filteredMatches.filter(isMatchFinished).map((match) => (
                  <div
                    key={match.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {match.home_team} <span className="text-gray-400">{t('vs')}</span> {match.away_team}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📅 {new Date(match.match_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
                          🏆 {match.league}
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
