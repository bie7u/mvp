import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { matchService, betService } from '../../services/api';

const PredictMatch = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMatch = async () => {
      try {
        const response = await matchService.getMatches();
        const foundMatch = response.results?.find(m => m.id === parseInt(matchId)) || 
                          response.find(m => m.id === parseInt(matchId));
        setMatch(foundMatch);
      } catch (error) {
        console.error('Failed to load match:', error);
        setError('Failed to load match details');
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [matchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await betService.createBet({
        match: parseInt(matchId),
        predicted_home_score: parseInt(homeScore),
        predicted_away_score: parseInt(awayScore),
        predicted_scorers: [],
      });
      navigate('/my-bets');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit prediction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!match) {
    return <div className="text-center p-8">Match not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card title="⚽ Make Your Prediction">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">
              {match.home_team} vs {match.away_team}
            </div>
            <div className="text-gray-600">
              {new Date(match.match_date).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {match.league} {match.round && `- ${match.round}`}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {match.home_team} Score
              </label>
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {match.away_team} Score
              </label>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="text-center text-3xl font-bold text-gray-700">
            {homeScore} - {awayScore}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Prediction'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PredictMatch;
