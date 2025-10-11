import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award } from 'lucide-react';

// Mock ranking data
const rankingData = [
  { position: 1, player: 'John Smith', team: 'Manchester City', points: 285, goals: 28, assists: 15, matches: 35 },
  { position: 2, player: 'Mike Johnson', team: 'Arsenal', points: 278, goals: 25, assists: 18, matches: 35 },
  { position: 3, player: 'David Williams', team: 'Liverpool', points: 265, goals: 24, assists: 14, matches: 34 },
  { position: 4, player: 'James Brown', team: 'Aston Villa', points: 252, goals: 22, assists: 16, matches: 35 },
  { position: 5, player: 'Robert Davis', team: 'Tottenham', points: 248, goals: 21, assists: 17, matches: 35 },
  { position: 6, player: 'Thomas Wilson', team: 'Chelsea', points: 245, goals: 23, assists: 12, matches: 34 },
  { position: 7, player: 'Chris Taylor', team: 'Newcastle', points: 238, goals: 20, assists: 15, matches: 35 },
  { position: 8, player: 'Daniel Anderson', team: 'Brighton', points: 235, goals: 19, assists: 16, matches: 34 },
  { position: 9, player: 'Matthew Martinez', team: 'West Ham', points: 228, goals: 18, assists: 14, matches: 35 },
  { position: 10, player: 'Andrew Garcia', team: 'Everton', points: 222, goals: 17, assists: 15, matches: 34 },
];

const Ranking = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Player Rankings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Top players ranked by performance metrics
        </p>
      </div>

      {/* Top 3 Players Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {rankingData.slice(0, 3).map((player, index) => (
          <motion.div
            key={player.position}
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
                  {player.position}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{player.player}</h3>
                  <p className="text-sm text-white/80">{player.team}</p>
                </div>
              </div>
              {index === 0 && <Trophy className="h-8 w-8 text-white" />}
              {index === 1 && <Award className="h-8 w-8 text-white" />}
              {index === 2 && <TrendingUp className="h-8 w-8 text-white" />}
            </div>
            <div className="grid grid-cols-2 gap-4 text-white">
              <div>
                <p className="text-xs text-white/80">Points</p>
                <p className="text-xl font-bold">{player.points}</p>
              </div>
              <div>
                <p className="text-xs text-white/80">Goals</p>
                <p className="text-xl font-bold">{player.goals}</p>
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
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Goals
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Assists
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Matches
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {rankingData.map((player, index) => (
                <tr
                  key={player.position}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    index < 3 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
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
                        {player.position}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {player.player}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {player.team}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {player.points}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {player.goals}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {player.assists}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {player.matches}
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
