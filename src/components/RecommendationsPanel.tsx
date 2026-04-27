import React, { useState, useEffect } from 'react';
import { Recommendation, LeaderboardEntry } from '../types/gamification';
import {
  generateRecommendations,
  getGlobalLeaderboard,
  getLeaderboardByCategory,
  getUserRank,
  calculateRankChange,
  getTopUsers,
  getNearbyUsers
} from '../utils/recommendationLogic';

interface RecommendationsPanelProps {
  userId: string;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'leaderboard'>('recommendations');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardCategory, setLeaderboardCategory] = useState<'xp' | 'streak' | 'lessons' | 'challenges'>('xp');
  const [userRank, setUserRank] = useState(0);
  const [rankChange, setRankChange] = useState(0);

  useEffect(() => {
    setRecommendations(generateRecommendations(userId));
    setLeaderboard(getGlobalLeaderboard());
    setUserRank(getUserRank(userId));
    setRankChange(calculateRankChange(userId));
  }, [userId]);

  const handleCategoryChange = (category: 'xp' | 'streak' | 'lessons' | 'challenges') => {
    setLeaderboardCategory(category);
    setLeaderboard(getLeaderboardByCategory(category));
  };

  return (
    <div className="recommendations-panel bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-violet-600 dark:text-violet-400">🎯 Recomendações</h2>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'recommendations'
              ? 'bg-violet-500 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-gray-600'
          }`}
        >
          📋 Para Você
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-violet-500 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-gray-600'
          }`}
        >
          🏆 Ranking
        </button>
      </div>

      {/* Recomendações */}
      {activeTab === 'recommendations' && (
        <div>
          {recommendations.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              <div className="text-4xl mb-2">🎯</div>
              <div>Nenhuma recomendação no momento</div>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map(rec => (
                <div
                  key={rec.id}
                  className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md ${
                    rec.priority === 'high' ? 'border-2 border-violet-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-2xl mr-2">
                          {rec.type === 'lesson' ? '📚' :
                           rec.type === 'microlesson' ? '⚡' :
                           rec.type === 'challenge' ? '🎮' :
                           rec.type === 'certification' ? '🎓' :
                           rec.type === 'mentor' ? '🤝' :
                           '🛤️'}
                        </span>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{rec.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.description}</p>
                      <div className="text-xs text-violet-600 dark:text-violet-400">
                        {rec.reason}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
                        {rec.confidence}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Confiança</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.priority === 'high' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300' :
                      rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                      'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                    }`}>
                      {rec.priority === 'high' ? 'Alta Prioridade' :
                       rec.priority === 'medium' ? 'Média Prioridade' :
                       'Baixa Prioridade'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                      {rec.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div>
          {/* Seu Ranking */}
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg p-4 mb-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Sua Posição</div>
                <div className="text-3xl font-bold">#{userRank}</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${rankChange > 0 ? 'text-green-300' : rankChange < 0 ? 'text-red-300' : 'text-white'}`}>
                  {rankChange > 0 ? `↑ ${rankChange}` : rankChange < 0 ? `↓ ${Math.abs(rankChange)}` : '='}
                </div>
                <div className="text-xs opacity-90">Mudança</div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex space-x-2 mb-4">
            {(['xp', 'streak', 'lessons', 'challenges'] as const).map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  leaderboardCategory === category
                    ? 'bg-violet-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-gray-600'
                }`}
              >
                {category === 'xp' ? 'XP' :
                 category === 'streak' ? 'Streak' :
                 category === 'lessons' ? 'Aulas' :
                 'Desafios'}
              </button>
            ))}
          </div>

          {/* Top 3 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <div
                key={entry.userId}
                className={`bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-md ${
                  index === 0 ? 'border-2 border-yellow-400' :
                  index === 1 ? 'border-2 border-gray-300' :
                  'border-2 border-orange-300'
                }`}
              >
                <div className="text-3xl mb-2">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                  {entry.userName.charAt(0)}
                </div>
                <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{entry.userName}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {leaderboardCategory === 'xp' ? `${entry.xp} XP` :
                   leaderboardCategory === 'streak' ? `${entry.streak} dias` :
                   leaderboardCategory === 'lessons' ? `${entry.completedLessons} aulas` :
                   `${entry.completedChallenges} desafios`}
                </div>
              </div>
            ))}
          </div>

          {/* Lista Completa */}
          <div className="space-y-2">
            {leaderboard.slice(3).map((entry, index) => (
              <div
                key={entry.userId}
                className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm flex items-center"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {entry.userName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">{entry.userName}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Nível {entry.level} • Streak {entry.streak}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-violet-600 dark:text-violet-400">
                    {leaderboardCategory === 'xp' ? entry.xp :
                     leaderboardCategory === 'streak' ? entry.streak :
                     leaderboardCategory === 'lessons' ? entry.completedLessons :
                     entry.completedChallenges}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    #{index + 4}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPanel;
