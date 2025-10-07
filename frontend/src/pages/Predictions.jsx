import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';

function Predictions() {
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [selectedRound, setSelectedRound] = useState('all');
  const [predictions, setPredictions] = useState({});
  const queryClient = useQueryClient();

  // Fetch matches grouped by league
  const { data: matchesByLeague, isLoading: matchesLoading } = useQuery(
    'matches-by-league',
    async () => {
      const response = await api.get('/matches/matches/by_league/');
      return response.data;
    }
  );

  // Fetch user's predictions
  const { data: userPredictions } = useQuery('my-predictions', async () => {
    const response = await api.get('/predictions/predictions/my_predictions/');
    return response.data;
  });

  // Fetch leagues
  const { data: leagues } = useQuery('leagues', async () => {
    const response = await api.get('/matches/leagues/?is_active=true');
    return response.data;
  });

  // Create prediction mutation
  const createPrediction = useMutation(
    (predictionData) => api.post('/predictions/predictions/', predictionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-predictions');
        queryClient.invalidateQueries('matches-by-league');
        queryClient.invalidateQueries('my-stats');
      },
    }
  );

  // Update prediction mutation
  const updatePrediction = useMutation(
    ({ id, data }) => api.put(`/predictions/predictions/${id}/`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-predictions');
        queryClient.invalidateQueries('matches-by-league');
        queryClient.invalidateQueries('my-stats');
      },
    }
  );

  // Handle prediction form input
  const handlePredictionChange = (matchId, field, value) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  // Submit prediction
  const handlePredictionSubmit = async (match) => {
    const predictionData = predictions[match.id];
    if (!predictionData?.home_score || !predictionData?.away_score) {
      alert('Please enter both scores');
      return;
    }

    const existingPrediction = userPredictions?.find((p) => p.match === match.id);

    try {
      if (existingPrediction) {
        await updatePrediction.mutateAsync({
          id: existingPrediction.id,
          data: {
            match: match.id,
            home_score: parseInt(predictionData.home_score),
            away_score: parseInt(predictionData.away_score),
          },
        });
      } else {
        await createPrediction.mutateAsync({
          match: match.id,
          home_score: parseInt(predictionData.home_score),
          away_score: parseInt(predictionData.away_score),
        });
      }

      // Clear the form
      setPredictions((prev) => {
        const newPredictions = { ...prev };
        delete newPredictions[match.id];
        return newPredictions;
      });
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save prediction');
    }
  };

  // Get all unique rounds from matches
  const getAllRounds = () => {
    if (!matchesByLeague) return [];
    const rounds = new Set();
    Object.values(matchesByLeague).forEach((matches) => {
      matches.forEach((match) => rounds.add(match.round));
    });
    return Array.from(rounds).sort();
  };

  // Filter matches based on selected league and round
  const getFilteredMatches = () => {
    if (!matchesByLeague) return {};

    if (selectedLeague === 'all' && selectedRound === 'all') {
      return matchesByLeague;
    }

    const filtered = {};
    Object.entries(matchesByLeague).forEach(([leagueName, matches]) => {
      const leagueMatches = matches.filter((match) => {
        const leagueMatch = selectedLeague === 'all' || leagueName === selectedLeague;
        const roundMatch = selectedRound === 'all' || match.round === selectedRound;
        return leagueMatch && roundMatch;
      });
      if (leagueMatches.length > 0) {
        filtered[leagueName] = leagueMatches;
      }
    });
    return filtered;
  };

  const filteredMatches = getFilteredMatches();
  const rounds = getAllRounds();

  // Get existing prediction for a match
  const getExistingPrediction = (matchId) => {
    return userPredictions?.find((p) => p.match === matchId);
  };

  // Check if match has started
  const hasMatchStarted = (startTime) => {
    return new Date(startTime) <= new Date();
  };

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Match Predictions</h1>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* League Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by League
            </label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Leagues</option>
              {matchesByLeague &&
                Object.keys(matchesByLeague).map((league) => (
                  <option key={league} value={league}>
                    {league}
                  </option>
                ))}
            </select>
          </div>

          {/* Round Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Round
            </label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Rounds</option>
              {rounds.map((round) => (
                <option key={round} value={round}>
                  {round}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Matches by League */}
      {matchesLoading ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-center">Loading matches...</p>
        </div>
      ) : Object.keys(filteredMatches).length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-center">
            No upcoming matches available. Please check back later or contact your admin to configure leagues.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(filteredMatches).map(([leagueName, matches]) => (
            <div key={leagueName} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="bg-primary-600 px-6 py-3">
                <h2 className="text-lg font-semibold text-white">{leagueName}</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {matches.map((match) => {
                  const existingPrediction = getExistingPrediction(match.id);
                  const matchStarted = hasMatchStarted(match.start_time);
                  const predictionValues = predictions[match.id] || {
                    home_score: existingPrediction?.home_score || '',
                    away_score: existingPrediction?.away_score || '',
                  };

                  return (
                    <div key={match.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Match Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span className="font-medium">{match.round}</span>
                            <span>•</span>
                            <span>{new Date(match.start_time).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>
                              {new Date(match.start_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {match.status !== 'SCHEDULED' && (
                              <>
                                <span>•</span>
                                <span className={`font-medium ${
                                  match.status === 'FINISHED' ? 'text-green-600' :
                                  match.status === 'IN_PLAY' ? 'text-blue-600' :
                                  'text-gray-600'
                                }`}>
                                  {match.status.replace('_', ' ')}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {match.home_team_name} vs {match.away_team_name}
                          </div>
                          {match.status === 'FINISHED' && match.home_score !== null && (
                            <div className="text-sm text-gray-600 mt-1">
                              Final Score: {match.home_score} - {match.away_score}
                            </div>
                          )}
                        </div>

                        {/* Prediction Form or Display */}
                        <div className="flex items-center gap-4">
                          {!matchStarted ? (
                            <>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={predictionValues.home_score}
                                  onChange={(e) =>
                                    handlePredictionChange(match.id, 'home_score', e.target.value)
                                  }
                                  placeholder="0"
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={predictionValues.away_score}
                                  onChange={(e) =>
                                    handlePredictionChange(match.id, 'away_score', e.target.value)
                                  }
                                  placeholder="0"
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                              </div>
                              <button
                                onClick={() => handlePredictionSubmit(match)}
                                disabled={
                                  createPrediction.isLoading || updatePrediction.isLoading
                                }
                                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {existingPrediction ? 'Update' : 'Predict'}
                              </button>
                            </>
                          ) : existingPrediction ? (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Your prediction:</div>
                              <div className="text-lg font-semibold text-gray-900">
                                {existingPrediction.home_score} - {existingPrediction.away_score}
                              </div>
                              {existingPrediction.points_earned > 0 && (
                                <div className="text-sm text-green-600 font-medium">
                                  +{existingPrediction.points_earned} points
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              Match started - No prediction made
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Predictions;
