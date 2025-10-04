import React, { useState } from 'react';
import Card from '../common/Card';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock data for league standings
const mockStandings = {
  bundesliga: {
    name: 'Bundesliga',
    season: '2023/2024',
    currentRound: 15,
    totalRounds: 34,
    standings: [
      { position: 1, team: 'Bayern Munich', played: 15, won: 11, drawn: 2, lost: 2, goalsFor: 42, goalsAgainst: 15, goalDifference: 27, points: 35 },
      { position: 2, team: 'Bayer Leverkusen', played: 15, won: 10, drawn: 3, lost: 2, goalsFor: 38, goalsAgainst: 18, goalDifference: 20, points: 33 },
      { position: 3, team: 'RB Leipzig', played: 15, won: 9, drawn: 4, lost: 2, goalsFor: 35, goalsAgainst: 20, goalDifference: 15, points: 31 },
      { position: 4, team: 'Borussia Dortmund', played: 15, won: 9, drawn: 2, lost: 4, goalsFor: 32, goalsAgainst: 22, goalDifference: 10, points: 29 },
      { position: 5, team: 'VfB Stuttgart', played: 15, won: 8, drawn: 3, lost: 4, goalsFor: 30, goalsAgainst: 25, goalDifference: 5, points: 27 },
      { position: 6, team: 'Eintracht Frankfurt', played: 15, won: 7, drawn: 4, lost: 4, goalsFor: 28, goalsAgainst: 24, goalDifference: 4, points: 25 },
      { position: 7, team: 'Freiburg', played: 15, won: 7, drawn: 3, lost: 5, goalsFor: 26, goalsAgainst: 23, goalDifference: 3, points: 24 },
      { position: 8, team: 'Hoffenheim', played: 15, won: 6, drawn: 5, lost: 4, goalsFor: 25, goalsAgainst: 22, goalDifference: 3, points: 23 },
      { position: 9, team: 'Wolfsburg', played: 15, won: 6, drawn: 4, lost: 5, goalsFor: 24, goalsAgainst: 23, goalDifference: 1, points: 22 },
      { position: 10, team: 'Borussia M\'gladbach', played: 15, won: 5, drawn: 6, lost: 4, goalsFor: 23, goalsAgainst: 22, goalDifference: 1, points: 21 },
      { position: 11, team: 'Mainz 05', played: 15, won: 5, drawn: 5, lost: 5, goalsFor: 21, goalsAgainst: 22, goalDifference: -1, points: 20 },
      { position: 12, team: 'Union Berlin', played: 15, won: 5, drawn: 4, lost: 6, goalsFor: 20, goalsAgainst: 23, goalDifference: -3, points: 19 },
      { position: 13, team: 'Augsburg', played: 15, won: 4, drawn: 6, lost: 5, goalsFor: 18, goalsAgainst: 24, goalDifference: -6, points: 18 },
      { position: 14, team: 'Werder Bremen', played: 15, won: 4, drawn: 5, lost: 6, goalsFor: 19, goalsAgainst: 26, goalDifference: -7, points: 17 },
      { position: 15, team: 'Bochum', played: 15, won: 3, drawn: 6, lost: 6, goalsFor: 16, goalsAgainst: 25, goalDifference: -9, points: 15 },
      { position: 16, team: 'Heidenheim', played: 15, won: 3, drawn: 5, lost: 7, goalsFor: 15, goalsAgainst: 26, goalDifference: -11, points: 14 },
      { position: 17, team: 'FC Köln', played: 15, won: 2, drawn: 6, lost: 7, goalsFor: 14, goalsAgainst: 28, goalDifference: -14, points: 12 },
      { position: 18, team: 'Darmstadt', played: 15, won: 1, drawn: 4, lost: 10, goalsFor: 12, goalsAgainst: 35, goalDifference: -23, points: 7 },
    ]
  },
  laliga: {
    name: 'La Liga',
    season: '2023/2024',
    currentRound: 16,
    totalRounds: 38,
    standings: [
      { position: 1, team: 'Real Madrid', played: 16, won: 12, drawn: 3, lost: 1, goalsFor: 38, goalsAgainst: 12, goalDifference: 26, points: 39 },
      { position: 2, team: 'Girona', played: 16, won: 12, drawn: 2, lost: 2, goalsFor: 36, goalsAgainst: 16, goalDifference: 20, points: 38 },
      { position: 3, team: 'Barcelona', played: 16, won: 11, drawn: 3, lost: 2, goalsFor: 34, goalsAgainst: 15, goalDifference: 19, points: 36 },
      { position: 4, team: 'Atletico Madrid', played: 16, won: 10, drawn: 4, lost: 2, goalsFor: 32, goalsAgainst: 16, goalDifference: 16, points: 34 },
      { position: 5, team: 'Athletic Bilbao', played: 16, won: 9, drawn: 4, lost: 3, goalsFor: 29, goalsAgainst: 18, goalDifference: 11, points: 31 },
      { position: 6, team: 'Real Sociedad', played: 16, won: 8, drawn: 5, lost: 3, goalsFor: 28, goalsAgainst: 19, goalDifference: 9, points: 29 },
      { position: 7, team: 'Valencia', played: 16, won: 7, drawn: 6, lost: 3, goalsFor: 25, goalsAgainst: 20, goalDifference: 5, points: 27 },
      { position: 8, team: 'Real Betis', played: 16, won: 6, drawn: 7, lost: 3, goalsFor: 23, goalsAgainst: 19, goalDifference: 4, points: 25 },
      { position: 9, team: 'Las Palmas', played: 16, won: 7, drawn: 3, lost: 6, goalsFor: 22, goalsAgainst: 21, goalDifference: 1, points: 24 },
      { position: 10, team: 'Getafe', played: 16, won: 6, drawn: 5, lost: 5, goalsFor: 21, goalsAgainst: 21, goalDifference: 0, points: 23 },
      { position: 11, team: 'Rayo Vallecano', played: 16, won: 5, drawn: 6, lost: 5, goalsFor: 19, goalsAgainst: 22, goalDifference: -3, points: 21 },
      { position: 12, team: 'Osasuna', played: 16, won: 5, drawn: 5, lost: 6, goalsFor: 20, goalsAgainst: 24, goalDifference: -4, points: 20 },
      { position: 13, team: 'Sevilla', played: 16, won: 4, drawn: 7, lost: 5, goalsFor: 18, goalsAgainst: 23, goalDifference: -5, points: 19 },
      { position: 14, team: 'Villarreal', played: 16, won: 5, drawn: 4, lost: 7, goalsFor: 19, goalsAgainst: 25, goalDifference: -6, points: 19 },
      { position: 15, team: 'Alaves', played: 16, won: 4, drawn: 6, lost: 6, goalsFor: 16, goalsAgainst: 23, goalDifference: -7, points: 18 },
      { position: 16, team: 'Cadiz', played: 16, won: 3, drawn: 7, lost: 6, goalsFor: 14, goalsAgainst: 23, goalDifference: -9, points: 16 },
      { position: 17, team: 'Mallorca', played: 16, won: 2, drawn: 8, lost: 6, goalsFor: 13, goalsAgainst: 24, goalDifference: -11, points: 14 },
      { position: 18, team: 'Celta Vigo', played: 16, won: 2, drawn: 7, lost: 7, goalsFor: 15, goalsAgainst: 28, goalDifference: -13, points: 13 },
      { position: 19, team: 'Granada', played: 16, won: 2, drawn: 5, lost: 9, goalsFor: 14, goalsAgainst: 30, goalDifference: -16, points: 11 },
      { position: 20, team: 'Almeria', played: 16, won: 1, drawn: 5, lost: 10, goalsFor: 12, goalsAgainst: 32, goalDifference: -20, points: 8 },
    ]
  }
};

const LeagueStandings = () => {
  const { t } = useLanguage();
  const [selectedLeague, setSelectedLeague] = useState('bundesliga');

  const currentLeague = mockStandings[selectedLeague];

  const getPositionColor = (position) => {
    if (position <= 4) return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
    if (position <= 6) return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
    if (position >= currentLeague.standings.length - 2) return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
    return '';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🏆 {t('leagueStandings')}
        </h1>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLeague('bundesliga')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedLeague === 'bundesliga'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🇩🇪 Bundesliga
          </button>
          <button
            onClick={() => setSelectedLeague('laliga')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedLeague === 'laliga'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🇪🇸 La Liga
          </button>
        </div>
      </div>

      <Card>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{currentLeague.name}</h2>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('season')}: {currentLeague.season}</p>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {t('round')} {currentLeague.currentRound}/{currentLeague.totalRounds}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">{t('championsLeague')}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">{t('europaLeague')}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">{t('relegation')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('team')}</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('played')}</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('won')}</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('drawn')}</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('lost')}</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('gf')}</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('ga')}</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('gd')}</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('pts')}</th>
              </tr>
            </thead>
            <tbody>
              {currentLeague.standings.map((team) => (
                <tr
                  key={team.position}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${getPositionColor(team.position)}`}
                >
                  <td className="py-3 px-2 font-bold text-gray-700 dark:text-gray-300 text-sm">{team.position}</td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{team.team}</td>
                  <td className="text-center py-3 px-2 text-gray-700 dark:text-gray-300 text-sm">{team.played}</td>
                  <td className="text-center py-3 px-2 text-gray-700 dark:text-gray-300 text-sm">{team.won}</td>
                  <td className="text-center py-3 px-2 text-gray-700 dark:text-gray-300 text-sm">{team.drawn}</td>
                  <td className="text-center py-3 px-2 text-gray-700 dark:text-gray-300 text-sm">{team.lost}</td>
                  <td className="text-center py-3 px-2 text-gray-700 dark:text-gray-300 text-sm">{team.goalsFor}</td>
                  <td className="text-center py-3 px-2 text-gray-700 dark:text-gray-300 text-sm">{team.goalsAgainst}</td>
                  <td className={`text-center py-3 px-2 font-semibold text-sm ${
                    team.goalDifference > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : team.goalDifference < 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                  </td>
                  <td className="text-center py-3 px-2 font-bold text-blue-600 dark:text-blue-400 text-sm">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LeagueStandings;
