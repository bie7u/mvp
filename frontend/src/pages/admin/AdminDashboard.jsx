import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

function AdminDashboard() {
  const { isRootAdmin, user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch users count
        const usersResponse = await api.get('/accounts/users/');
        const usersCount = usersResponse.data.length || usersResponse.data.count || 0;

        let companiesCount = 0;
        let leaguesCount = 0;

        if (isRootAdmin()) {
          // Only root admin can see companies and leagues
          const companiesResponse = await api.get('/companies/companies/');
          companiesCount = companiesResponse.data.length || companiesResponse.data.count || 0;

          const leaguesResponse = await api.get('/matches/leagues/');
          leaguesCount = leaguesResponse.data.length || leaguesResponse.data.count || 0;
        }

        setStats({
          users: usersCount,
          companies: companiesCount,
          leagues: leaguesCount,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isRootAdmin]);

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage users, invite new users, and view user details',
      link: '/admin/users',
      icon: '👥',
      stat: stats?.users,
      statLabel: 'Total Users',
      available: true,
    },
    {
      title: 'Company Management',
      description: 'Manage companies and their configurations',
      link: '/admin/companies',
      icon: '🏢',
      stat: stats?.companies,
      statLabel: 'Total Companies',
      available: isRootAdmin(),
    },
    {
      title: 'League Management',
      description: 'Manage football leagues and competitions',
      link: '/admin/leagues',
      icon: '⚽',
      stat: stats?.leagues,
      statLabel: 'Total Leagues',
      available: isRootAdmin(),
    },
  ];

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome, {user?.first_name || user?.email}. Manage your platform from here.
        </p>
      </div>

      {loading ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminCards.filter(card => card.available).map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{card.icon}</div>
                {card.stat !== undefined && card.stat !== null && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{card.stat}</div>
                    <div className="text-xs text-gray-500">{card.statLabel}</div>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h2>
              <p className="text-gray-600 text-sm">{card.description}</p>
              <div className="mt-4 flex items-center text-primary-600 font-medium text-sm">
                Manage <span className="ml-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
