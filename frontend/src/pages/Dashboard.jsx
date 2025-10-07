import { useQuery } from 'react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';

function Dashboard() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery('my-stats', async () => {
    const response = await api.get('/predictions/rankings/my_stats/');
    return response.data;
  });

  const { data: upcomingMatches } = useQuery('upcoming-matches', async () => {
    const response = await api.get('/matches/matches/upcoming/');
    return response.data;
  });

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome, {user?.first_name || user?.email}!
        </h2>
        <p className="text-gray-600 mt-2">
          Company: {user?.company_name || 'N/A'}
        </p>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Points</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{stats.total_points}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Predictions</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{stats.total_predictions}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Accuracy</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{stats.accuracy_percentage}%</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Rank</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">#{stats.rank}</p>
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Matches</h2>
        {upcomingMatches && upcomingMatches.length > 0 ? (
          <div className="space-y-4">
            {upcomingMatches.slice(0, 5).map((match) => (
              <div key={match.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{match.league_name}</p>
                  <p className="font-medium">{match.home_team_name} vs {match.away_team_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(match.start_time).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming matches</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
