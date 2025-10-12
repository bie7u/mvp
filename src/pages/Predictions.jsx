import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy, CheckCircle, XCircle, Filter } from 'lucide-react';
import { predictionsService } from '../services/api';

const Predictions = () => {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState('all');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Calculate date range for next week
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        // Server-side filtering: send date range and league filter
        const params = {
          startDate: today.toISOString().split('T')[0],
          endDate: nextWeek.toISOString().split('T')[0],
        };
        
        if (selectedLeague !== 'all') {
          params.league = selectedLeague;
        }
        
        const response = await predictionsService.getUpcomingMatches(params);
        setMatches(response.data.matches);
        
        // Load existing predictions
        const predictionsResponse = await predictionsService.getUserPredictions();
        const userPredictions = {};
        predictionsResponse.data.predictions.forEach(pred => {
          userPredictions[pred.matchId] = {
            homeScore: pred.homeScore,
            awayScore: pred.awayScore,
            id: pred.id
          };
        });
        setPredictions(userPredictions);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedLeague]);

  const handlePredictionChange = (matchId, team, value) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value === '' ? '' : parseInt(value, 10)
      }
    }));
  };

  const handleSubmitPrediction = async (matchId) => {
    const prediction = predictions[matchId];
    if (prediction?.homeScore === '' || prediction?.awayScore === '' || 
        prediction?.homeScore === undefined || prediction?.awayScore === undefined) {
      alert('Please enter both scores');
      return;
    }

    setSaving(true);
    try {
      if (prediction.id) {
        await predictionsService.updatePrediction(prediction.id, {
          matchId,
          homeScore: prediction.homeScore,
          awayScore: prediction.awayScore
        });
      } else {
        const response = await predictionsService.createPrediction({
          matchId,
          homeScore: prediction.homeScore,
          awayScore: prediction.awayScore
        });
        setPredictions(prev => ({
          ...prev,
          [matchId]: {
            ...prev[matchId],
            id: response.data.prediction.id
          }
        }));
      }
      alert('Prediction saved successfully!');
    } catch (error) {
      console.error('Failed to save prediction:', error);
      alert('Failed to save prediction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isPredictionComplete = (matchId) => {
    const prediction = predictions[matchId];
    return prediction && 
           prediction.homeScore !== undefined && 
           prediction.homeScore !== '' &&
           prediction.awayScore !== undefined && 
           prediction.awayScore !== '';
  };

  // Get unique leagues from matches for the filter dropdown
  const leagues = useMemo(() => {
    // In a real server implementation, this would come from a separate API call
    // For now we'll keep this client-side for the UI dropdown
    const uniqueLeagues = [...new Set(matches.map(match => match.league))];
    return uniqueLeagues.sort();
  }, [matches]);

  // No client-side filtering needed - server handles it
  const filteredMatches = matches;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Match Predictions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Predict upcoming match scores and earn points
        </p>
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Scoring:</strong> 3 points for correct result (score), 1 point for correct winner
          </p>
        </div>
      </div>

      {/* League Filter */}
      {leagues.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <label htmlFor="league-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by League:
            </label>
            <select
              id="league-filter"
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Leagues</option>
              {leagues.map(league => (
                <option key={league} value={league}>{league}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filteredMatches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center"
        >
          <Trophy className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No upcoming matches available for predictions at the moment.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex flex-col space-y-4">
                {/* Match Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {match.date}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {match.time}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                    {match.league}
                  </span>
                </div>

                {/* Teams and Prediction Input */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Home Team */}
                  <div className="flex items-center justify-between md:justify-end">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {match.homeTeam}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={predictions[match.id]?.homeScore ?? ''}
                      onChange={(e) => handlePredictionChange(match.id, 'homeScore', e.target.value)}
                      className="w-16 ml-4 px-3 py-2 text-center text-lg font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                      disabled={match.locked}
                    />
                  </div>

                  {/* VS Separator */}
                  <div className="flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-400 dark:text-gray-600">VS</span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between md:justify-start">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={predictions[match.id]?.awayScore ?? ''}
                      onChange={(e) => handlePredictionChange(match.id, 'awayScore', e.target.value)}
                      className="w-16 mr-4 px-3 py-2 text-center text-lg font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                      disabled={match.locked}
                    />
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {match.awayTeam}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    {isPredictionComplete(match.id) && !match.locked && (
                      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Prediction saved</span>
                      </div>
                    )}
                    {match.locked && (
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <XCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Match started - Predictions locked</span>
                      </div>
                    )}
                  </div>
                  
                  {!match.locked && (
                    <button
                      onClick={() => handleSubmitPrediction(match.id)}
                      disabled={saving || !isPredictionComplete(match.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isPredictionComplete(match.id) && !saving
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {saving ? 'Saving...' : predictions[match.id]?.id ? 'Update Prediction' : 'Save Prediction'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Predictions;
