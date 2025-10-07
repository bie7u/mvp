import { useState, useEffect } from 'react';
import api from '../../services/api';

function LeagueManagement() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLeague, setEditingLeague] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: '',
    api_id: '',
    current_season: new Date().getFullYear(),
    is_active: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const leagueChoices = [
    { value: 'premier_league', label: 'Premier League (England)' },
    { value: 'la_liga', label: 'La Liga (Spain)' },
    { value: 'bundesliga', label: 'Bundesliga (Germany)' },
    { value: 'serie_a', label: 'Serie A (Italy)' },
    { value: 'ligue_1', label: 'Ligue 1 (France)' },
    { value: 'ekstraklasa', label: 'Ekstraklasa (Poland)' },
  ];

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches/leagues/');
      setLeagues(Array.isArray(response.data) ? response.data : response.data.results || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching leagues:', err);
      setError('Failed to load leagues');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingLeague) {
        await api.put(`/matches/leagues/${editingLeague.id}/`, formData);
      } else {
        await api.post('/matches/leagues/', formData);
      }
      setShowCreateForm(false);
      setEditingLeague(null);
      setFormData({
        name: '',
        code: '',
        country: '',
        api_id: '',
        current_season: new Date().getFullYear(),
        is_active: true,
      });
      fetchLeagues();
    } catch (err) {
      console.error('Error saving league:', err);
      setFormError(
        err.response?.data?.code?.[0] || 
        err.response?.data?.api_id?.[0] || 
        err.response?.data?.error || 
        'Failed to save league'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (league) => {
    setEditingLeague(league);
    setFormData({
      name: league.name,
      code: league.code,
      country: league.country,
      api_id: league.api_id,
      current_season: league.current_season,
      is_active: league.is_active,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (leagueId) => {
    if (!window.confirm('Are you sure you want to delete this league? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/matches/leagues/${leagueId}/`);
      fetchLeagues();
    } catch (err) {
      console.error('Error deleting league:', err);
      alert('Failed to delete league');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingLeague(null);
    setFormData({
      name: '',
      code: '',
      country: '',
      api_id: '',
      current_season: new Date().getFullYear(),
      is_active: true,
    });
    setFormError(null);
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">League Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {showCreateForm ? 'Cancel' : 'Create League'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingLeague ? 'Edit League' : 'Create New League'}
          </h2>
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                League Code *
              </label>
              <select
                required
                value={formData.code}
                onChange={(e) => {
                  const selectedChoice = leagueChoices.find(c => c.value === e.target.value);
                  setFormData({ 
                    ...formData, 
                    code: e.target.value,
                    name: selectedChoice ? selectedChoice.label.split(' (')[0] : formData.name,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select League Code</option>
                {leagueChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                League Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API ID *
                </label>
                <input
                  type="number"
                  required
                  value={formData.api_id}
                  onChange={(e) => setFormData({ ...formData, api_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Season *
              </label>
              <input
                type="number"
                required
                value={formData.current_season}
                onChange={(e) => setFormData({ ...formData, current_season: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : editingLeague ? 'Update League' : 'Create League'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6">
            <p className="text-gray-600">Loading leagues...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : leagues.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-600">No leagues found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leagues.map((league) => (
                  <tr key={league.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{league.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{league.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{league.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{league.current_season}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {league.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      <button
                        onClick={() => handleEdit(league)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(league.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeagueManagement;
