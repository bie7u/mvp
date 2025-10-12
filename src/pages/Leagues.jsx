import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar } from 'lucide-react';

// Mock data for TOP 5 leagues
const leaguesData = [
  {
    id: 1,
    name: 'Premier League',
    country: 'England',
    season: '2024/25',
    standings: [
      { position: 1, team: 'Manchester City', played: 38, won: 28, drawn: 5, lost: 5, points: 89 },
      { position: 2, team: 'Arsenal', played: 38, won: 28, drawn: 5, lost: 5, points: 89 },
      { position: 3, team: 'Liverpool', played: 38, won: 24, drawn: 10, lost: 4, points: 82 },
      { position: 4, team: 'Aston Villa', played: 38, won: 20, drawn: 8, lost: 10, points: 68 },
      { position: 5, team: 'Tottenham', played: 38, won: 20, drawn: 6, lost: 12, points: 66 },
    ],
    rounds: [
      { round: 38, date: '2025-05-25', matches: ['Man City vs West Ham', 'Arsenal vs Everton', 'Liverpool vs Crystal Palace'] },
      { round: 37, date: '2025-05-18', matches: ['Chelsea vs Man City', 'Tottenham vs Arsenal', 'Brighton vs Liverpool'] },
      { round: 36, date: '2025-05-11', matches: ['Man City vs Fulham', 'Arsenal vs Man United', 'Liverpool vs Aston Villa'] },
    ],
  },
  {
    id: 2,
    name: 'La Liga',
    country: 'Spain',
    season: '2024/25',
    standings: [
      { position: 1, team: 'Real Madrid', played: 38, won: 29, drawn: 6, lost: 3, points: 93 },
      { position: 2, team: 'Barcelona', played: 38, won: 27, drawn: 7, lost: 4, points: 88 },
      { position: 3, team: 'Girona', played: 38, won: 25, drawn: 5, lost: 8, points: 80 },
      { position: 4, team: 'Atletico Madrid', played: 38, won: 24, drawn: 5, lost: 9, points: 77 },
      { position: 5, team: 'Athletic Bilbao', played: 38, won: 19, drawn: 10, lost: 9, points: 67 },
    ],
    rounds: [
      { round: 38, date: '2025-05-26', matches: ['Real Madrid vs Real Betis', 'Barcelona vs Sevilla', 'Girona vs Granada'] },
      { round: 37, date: '2025-05-19', matches: ['Atletico vs Real Madrid', 'Valencia vs Barcelona', 'Villarreal vs Girona'] },
      { round: 36, date: '2025-05-12', matches: ['Real Madrid vs Alaves', 'Barcelona vs Real Sociedad', 'Girona vs Barcelona'] },
    ],
  },
  {
    id: 3,
    name: 'Serie A',
    country: 'Italy',
    season: '2024/25',
    standings: [
      { position: 1, team: 'Inter Milan', played: 38, won: 28, drawn: 7, lost: 3, points: 91 },
      { position: 2, team: 'AC Milan', played: 38, won: 24, drawn: 8, lost: 6, points: 80 },
      { position: 3, team: 'Juventus', played: 38, won: 23, drawn: 9, lost: 6, points: 78 },
      { position: 4, team: 'Atalanta', played: 38, won: 21, drawn: 9, lost: 8, points: 72 },
      { position: 5, team: 'Roma', played: 38, won: 20, drawn: 9, lost: 9, points: 69 },
    ],
    rounds: [
      { round: 38, date: '2025-05-24', matches: ['Inter vs Lazio', 'AC Milan vs Sassuolo', 'Juventus vs Bologna'] },
      { round: 37, date: '2025-05-17', matches: ['Napoli vs Inter', 'Torino vs AC Milan', 'Atalanta vs Juventus'] },
      { round: 36, date: '2025-05-10', matches: ['Inter vs Frosinone', 'AC Milan vs Cagliari', 'Juventus vs Salernitana'] },
    ],
  },
  {
    id: 4,
    name: 'Bundesliga',
    country: 'Germany',
    season: '2024/25',
    standings: [
      { position: 1, team: 'Bayer Leverkusen', played: 34, won: 28, drawn: 6, lost: 0, points: 90 },
      { position: 2, team: 'Bayern Munich', played: 34, won: 23, drawn: 7, lost: 4, points: 76 },
      { position: 3, team: 'Stuttgart', played: 34, won: 23, drawn: 4, lost: 7, points: 73 },
      { position: 4, team: 'RB Leipzig', played: 34, won: 20, drawn: 7, lost: 7, points: 67 },
      { position: 5, team: 'Borussia Dortmund', played: 34, won: 18, drawn: 9, lost: 7, points: 63 },
    ],
    rounds: [
      { round: 34, date: '2025-05-18', matches: ['Leverkusen vs Augsburg', 'Bayern vs Hoffenheim', 'Stuttgart vs Monchengladbach'] },
      { round: 33, date: '2025-05-11', matches: ['Bochum vs Leverkusen', 'Wolfsburg vs Bayern', 'Stuttgart vs Frankfurt'] },
      { round: 32, date: '2025-05-04', matches: ['Leverkusen vs Roma', 'Bayern vs Real Madrid', 'Dortmund vs PSG'] },
    ],
  },
  {
    id: 5,
    name: 'Ligue 1',
    country: 'France',
    season: '2024/25',
    standings: [
      { position: 1, team: 'Paris Saint-Germain', played: 34, won: 26, drawn: 6, lost: 2, points: 84 },
      { position: 2, team: 'Monaco', played: 34, won: 22, drawn: 7, lost: 5, points: 73 },
      { position: 3, team: 'Brest', played: 34, won: 19, drawn: 9, lost: 6, points: 66 },
      { position: 4, team: 'Lille', played: 34, won: 18, drawn: 10, lost: 6, points: 64 },
      { position: 5, team: 'Nice', played: 34, won: 17, drawn: 11, lost: 6, points: 62 },
    ],
    rounds: [
      { round: 34, date: '2025-05-19', matches: ['PSG vs Toulouse', 'Monaco vs Lyon', 'Brest vs Nice'] },
      { round: 33, date: '2025-05-12', matches: ['Lens vs PSG', 'Marseille vs Monaco', 'Rennes vs Brest'] },
      { round: 32, date: '2025-05-05', matches: ['PSG vs Le Havre', 'Monaco vs Nantes', 'Brest vs Lille'] },
    ],
  },
];

const Leagues = () => {
  const [selectedLeague, setSelectedLeague] = useState(leaguesData[0]);
  const [activeTab, setActiveTab] = useState('standings'); // 'standings' or 'rounds'
  const [selectedRound, setSelectedRound] = useState(null);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Football Leagues
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          TOP 5 European football leagues standings and fixtures
        </p>
      </div>

      {/* League Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {leaguesData.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedLeague.id === league.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>
      </div>

      {/* League Info */}
      <motion.div
        key={selectedLeague.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedLeague.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedLeague.country} - Season {selectedLeague.season}
            </p>
          </div>
          <Trophy className="h-12 w-12 text-yellow-500" />
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab('standings')}
            className={`pb-2 px-1 font-medium transition-colors cursor-pointer ${
              activeTab === 'standings'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Standings
          </button>
          <button
            onClick={() => setActiveTab('rounds')}
            className={`pb-2 px-1 font-medium transition-colors cursor-pointer ${
              activeTab === 'rounds'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Fixtures
          </button>
        </div>

        {/* Standings Table */}
        {activeTab === 'standings' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    P
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    W
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    D
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    L
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {selectedLeague.standings.map((team, index) => (
                  <tr
                    key={team.position}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      index === 0 ? 'bg-green-50 dark:bg-green-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {team.position}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {team.team}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {team.played}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {team.won}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {team.drawn}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {team.lost}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {team.points}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rounds/Fixtures */}
        {activeTab === 'rounds' && (
          <div className="space-y-4">
            {/* Round Selector Dropdown */}
            <div className="mb-6">
              <label htmlFor="round-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Round
              </label>
              <select
                id="round-select"
                value={selectedRound || ''}
                onChange={(e) => setSelectedRound(e.target.value ? Number(e.target.value) : null)}
                className="block w-full md:w-64 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Rounds</option>
                {selectedLeague.rounds.map((round) => (
                  <option key={round.round} value={round.round}>
                    Round {round.round} - {round.date}
                  </option>
                ))}
              </select>
            </div>

            {selectedLeague.rounds
              .filter((round) => selectedRound === null || round.round === selectedRound)
              .map((round) => (
              <motion.div
                key={round.round}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Round {round.round}
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {round.date}
                  </span>
                </div>
                <ul className="space-y-2">
                  {round.matches.map((match, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      <span>{match}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Leagues;
