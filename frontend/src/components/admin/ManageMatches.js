import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { matchService } from '../../services/api';

const ManageMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    home_team: '',
    away_team: '',
    match_date: '',
    league: '',
    status: 'scheduled',
  });

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await matchService.getMatches();
      setMatches(data.results || data);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await matchService.createMatch(formData);
      setFormData({
        home_team: '',
        away_team: '',
        match_date: '',
        league: '',
        status: 'scheduled',
      });
      setShowForm(false);
      loadMatches();
    } catch (error) {
      console.error('Failed to create match:', error);
      alert('Failed to create match');
    }
  };

  const handleUpdateResult = async (matchId) => {
    const homeScore = prompt('Enter home team score:');
    const awayScore = prompt('Enter away team score:');
    
    if (homeScore !== null && awayScore !== null) {
      try {
        await matchService.updateMatchResult(matchId, parseInt(homeScore), parseInt(awayScore));
        loadMatches();
      } catch (error) {
        console.error('Failed to update result:', error);
        alert('Failed to update match result');
      }
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Manage Matches</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {showForm ? 'Cancel' : '+ Add Match'}
        </button>
      </div>

      {showForm && (
        <Card title="Add New Match">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home Team
                </label>
                <input
                  type="text"
                  value={formData.home_team}
                  onChange={(e) => setFormData({ ...formData, home_team: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Away Team
                </label>
                <input
                  type="text"
                  value={formData.away_team}
                  onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.match_date}
                  onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  League
                </label>
                <input
                  type="text"
                  value={formData.league}
                  onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Premier League"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
            >
              Create Match
            </button>
          </form>
        </Card>
      )}

      <Card title="Matches List">
        {matches.length === 0 ? (
          <p className="text-gray-500">No matches found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Match</th>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">League</th>
                  <th className="text-center py-3 px-2">Status</th>
                  <th className="text-center py-3 px-2">Score</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="font-semibold">
                        {match.home_team} vs {match.away_team}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm">
                      {new Date(match.match_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-sm">{match.league || '-'}</td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          match.status === 'finished'
                            ? 'bg-green-100 text-green-800'
                            : match.status === 'live'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {match.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-semibold">
                      {match.home_score !== null && match.away_score !== null
                        ? `${match.home_score} - ${match.away_score}`
                        : '-'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {match.status !== 'finished' && (
                        <button
                          onClick={() => handleUpdateResult(match.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Update Result
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManageMatches;
