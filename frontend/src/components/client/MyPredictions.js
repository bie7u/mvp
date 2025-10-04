import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import { betService } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

const MyPredictions = () => {
  const { t } = useLanguage();
  const [bets, setBets] = useState([]);
  const [filteredBets, setFilteredBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('all');

  const filterBets = useCallback(() => {
    let filtered = bets;
    
    // Filter by status
    if (filterStatus === 'pending') {
      filtered = filtered.filter(b => !b.is_processed);
    } else if (filterStatus === 'processed') {
      filtered = filtered.filter(b => b.is_processed);
    } else if (filterStatus === 'winning') {
      filtered = filtered.filter(b => b.is_processed && b.points_earned > 0);
    } else if (filterStatus === 'losing') {
      filtered = filtered.filter(b => b.is_processed && b.points_earned <= 0);
    }
    
    // Filter by league
    if (selectedLeague !== 'all') {
      filtered = filtered.filter(b => b.match_details?.league === selectedLeague);
    }
    
    setFilteredBets(filtered);
  }, [filterStatus, selectedLeague, bets]);

  useEffect(() => {
    loadBets();
  }, []);

  useEffect(() => {
    filterBets();
  }, [filterBets]);

  const loadBets = async () => {
    try {
      const data = await betService.getMyBets();
      setBets(data);
      
      // Extract unique leagues
      const uniqueLeagues = [...new Set(data.map(b => b.match_details?.league).filter(Boolean))].sort();
      setLeagues(uniqueLeagues);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const processedBets = bets.filter(b => b.is_processed);
    const totalPoints = processedBets.reduce((sum, b) => sum + (b.points_earned || 0), 0);
    const winningBets = processedBets.filter(b => b.points_earned > 0).length;
    const accuracy = processedBets.length > 0 ? (winningBets / processedBets.length) * 100 : 0;
    
    return {
      total: bets.length,
      processed: processedBets.length,
      pending: bets.length - processedBets.length,
      winning: winningBets,
      totalPoints,
      accuracy,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return <div className="text-center p-8 dark:text-gray-200">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        🎯 {t('myPredictions')}
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-blue-100 text-sm">{t('totalPredictions')}</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold">{stats.winning}</div>
            <div className="text-green-100 text-sm">{t('winningPredictions')}</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold">{stats.totalPoints}</div>
            <div className="text-purple-100 text-sm">{t('totalPoints')}</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold">{stats.accuracy.toFixed(1)}%</div>
            <div className="text-orange-100 text-sm">{t('accuracy')}</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('filterByStatus')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t('allStatus')} ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ⏳ {t('pending')} ({stats.pending})
              </button>
              <button
                onClick={() => setFilterStatus('processed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'processed'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ✔️ {t('processed')} ({stats.processed})
              </button>
              <button
                onClick={() => setFilterStatus('winning')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'winning'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🎉 {t('winning')} ({stats.winning})
              </button>
              <button
                onClick={() => setFilterStatus('losing')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'losing'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ❌ {t('losing')} ({stats.processed - stats.winning})
              </button>
            </div>
          </div>
          
          {leagues.length > 0 && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('filterByLeague')}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLeague('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedLeague === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {league}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Predictions List */}
      <Card>
        {filteredBets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl text-gray-600 dark:text-gray-400">{t('noPredictions')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{t('startPredicting')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBets.map((bet) => (
              <div
                key={bet.id}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {bet.match_details.home_team} <span className="text-gray-400">{t('vs')}</span> {bet.match_details.away_team}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      📅 {new Date(bet.match_details.match_date).toLocaleDateString()}
                    </div>
                    {bet.match_details.league && (
                      <div className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
                        🏆 {bet.match_details.league}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('yourPrediction')}</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {bet.predicted_home_score} - {bet.predicted_away_score}
                      </div>
                    </div>
                    
                    {bet.is_processed && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('actualScore')}</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {bet.match_details.home_score} - {bet.match_details.away_score}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      {bet.is_processed ? (
                        <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                          bet.points_earned > 0 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {bet.points_earned > 0 ? `+${bet.points_earned}` : bet.points_earned} {t('points')}
                        </span>
                      ) : (
                        <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 font-semibold text-sm">
                          ⏳ {t('pending')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyPredictions;
