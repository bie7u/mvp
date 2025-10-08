import React, { useState, useEffect, useCallback } from 'react';
import { matchesAPI, predictionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const [matchesRes, predictionsRes] = await Promise.all([
        matchesAPI.getMatches({ status: 'scheduled' }),
        predictionsAPI.getPredictions({ user: user?.id }),
      ]);

      setMatches(matchesRes.data.results || matchesRes.data);
      
      const predMap = {};
      (predictionsRes.data.results || predictionsRes.data).forEach(pred => {
        predMap[pred.match] = pred;
      });
      setPredictions(predMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePredictionSubmit = async (matchId, homeScore, awayScore) => {
    try {
      const existingPrediction = predictions[matchId];
      
      if (existingPrediction) {
        await predictionsAPI.updatePrediction(existingPrediction.id, {
          home_score: homeScore,
          away_score: awayScore,
        });
      } else {
        await predictionsAPI.createPrediction({
          match: matchId,
          home_score: homeScore,
          away_score: awayScore,
        });
      }
      
      fetchData();
    } catch (error) {
      console.error('Error saving prediction:', error);
      alert('Failed to save prediction');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Upcoming Matches
          </h1>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictions[match.id]}
                  onSubmit={handlePredictionSubmit}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchCard = ({ match, prediction, onSubmit }) => {
  const [homeScore, setHomeScore] = useState(prediction?.home_score || 0);
  const [awayScore, setAwayScore] = useState(prediction?.away_score || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(match.id, homeScore, awayScore);
  };

  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary-600">{match.league_name}</p>
          <p className="text-sm text-gray-500">{match.round}</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className="text-lg font-semibold">{match.home_team}</span>
            <span className="text-gray-500">vs</span>
            <span className="text-lg font-semibold">{match.away_team}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(match.kickoff_time).toLocaleString()}
          </p>
        </div>
        
        <div className="ml-4">
          {match.is_prediction_locked ? (
            <div className="text-sm text-gray-500">
              Prediction locked
              {prediction && (
                <div className="mt-1 font-semibold">
                  Your prediction: {prediction.home_score} - {prediction.away_score}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
              />
              <button
                type="submit"
                className="ml-2 px-4 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {prediction ? 'Update' : 'Predict'}
              </button>
            </form>
          )}
        </div>
      </div>
    </li>
  );
};

export default Dashboard;
