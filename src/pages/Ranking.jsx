import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { rankingService, clientService } from '../services/api';

const Ranking = () => {
  const { user } = useAuth();
  const [rankingData, setRankingData] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch clients for root_admin
  useEffect(() => {
    const fetchClients = async () => {
      if (user.role === 'root_admin') {
        try {
          const response = await clientService.getClients();
          const clientsList = response.data.clients;
          setClients(clientsList);
          // Set first client as default
          if (clientsList.length > 0) {
            setSelectedClientId(clientsList[0].id);
          }
        } catch (error) {
          console.error('Failed to fetch clients:', error);
        }
      }
    };

    fetchClients();
  }, [user.role]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        // For root_admin, use selected client; for others, don't pass clientId (backend uses auth)
        const clientId = user.role === 'root_admin' ? selectedClientId : undefined;
        const response = await rankingService.getRanking(clientId);
        setRankingData(response.data.rankings);
      } catch (error) {
        console.error('Failed to fetch ranking:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a selectedClientId for root_admin, or for non-root_admin users
    if (user.role !== 'root_admin' || selectedClientId) {
      fetchRanking();
    }
  }, [selectedClientId, user.role]);

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
          Prediction Rankings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {user.role === 'root_admin' 
            ? 'Overall prediction rankings across all users'
            : 'Your organization\'s prediction rankings'}
        </p>
        
        {/* Client Filter for Root Admin */}
        {user.role === 'root_admin' && clients.length > 0 && (
          <div className="mt-4">
            <label htmlFor="client-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Client
            </label>
            <select
              id="client-filter"
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(parseInt(e.target.value))}
              className="block w-full md:w-64 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Scoring:</strong> 3 points for correct result (exact score), 1 point for correct winner
          </p>
        </div>
      </div>

      {/* Top 3 Users Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {rankingData.slice(0, 3).map((userRank, index) => (
          <motion.div
            key={userRank.position}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg shadow-md p-6 ${
              index === 0
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                : index === 1
                ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                : 'bg-gradient-to-br from-orange-400 to-orange-600'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl ${
                    index === 0
                      ? 'bg-yellow-700 text-white'
                      : index === 1
                      ? 'bg-gray-700 text-white'
                      : 'bg-orange-700 text-white'
                  }`}
                >
                  {userRank.position}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{userRank.userName}</h3>
                  <p className="text-sm text-white/80">{userRank.email}</p>
                </div>
              </div>
              {index === 0 && <Trophy className="h-8 w-8 text-white" />}
              {index === 1 && <Award className="h-8 w-8 text-white" />}
              {index === 2 && <TrendingUp className="h-8 w-8 text-white" />}
            </div>
            <div className="grid grid-cols-2 gap-4 text-white">
              <div>
                <p className="text-xs text-white/80">Points</p>
                <p className="text-xl font-bold">{userRank.points}</p>
              </div>
              <div>
                <p className="text-xs text-white/80">Predictions</p>
                <p className="text-xl font-bold">{userRank.totalPredictions}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Ranking Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Complete Rankings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Correct Results
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Correct Winners
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Predictions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {rankingData.map((userRank, index) => (
                <tr
                  key={userRank.position}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    index < 3 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${userRank.userId === user.id ? 'bg-green-50 dark:bg-green-900/20 font-bold' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-500 text-white'
                            : index === 1
                            ? 'bg-gray-400 text-white'
                            : index === 2
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {userRank.position}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {userRank.userName}
                      {userRank.userId === user.id && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">(You)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {userRank.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {userRank.points}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {userRank.correctResults}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {userRank.correctWinners}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {userRank.totalPredictions}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Ranking;
