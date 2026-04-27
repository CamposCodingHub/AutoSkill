import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgressStore } from '../stores/useProgressStore';
import { LeaderboardEntry } from '../services/api';
import { calculateLevel, calculateLevelProgress, calculateTotalXP, getUnlockedAchievements, calculateStreak, isStreakAtRisk, getStreakFreezeCost } from '../utils/gamificationLogic';
import { requestNotificationPermission, checkStreakRisk } from '../utils/notifications';
import ChallengesPanel from './ChallengesPanel';
import { startStudySession, endStudySession, updateSessionActivity, loadSessionsFromStorage } from '../utils/analyticsLogic';
import { progressAPI } from '../services/api';

interface GamificationSystemProps {
  userId: string;
}

const GamificationSystem: React.FC<GamificationSystemProps> = ({ userId }) => {
  const { completedLessons, quizAnswers, getGamificationProfile, updateGamificationProfile, recordStudySession, syncGamificationWithAPI } = useProgressStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [hoveredUser, setHoveredUser] = useState<LeaderboardEntry | null>(null);

  // Carregar sessões do analytics ao montar
  useEffect(() => {
    loadSessionsFromStorage();
  }, []);

  // Sincronizar gamificação com API ao montar
  useEffect(() => {
    syncGamificationWithAPI();
  }, []);

  // Carregar leaderboard real da API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await progressAPI.getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Erro ao carregar leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  // Iniciar sessão de analytics quando o componente monta
  useEffect(() => {
    const session = startStudySession(userId);
    setCurrentSessionId(session.id);

    return () => {
      if (currentSessionId) {
        endStudySession(currentSessionId);
      }
    };
  }, [userId]);

  // Obter perfil do usuário ou criar perfil padrão
  const profile = getGamificationProfile() || {
    totalXP: 0,
    currentLevel: 1,
    levelProgress: 0,
    streak: 0,
    longestStreak: 0,
    achievements: [],
    weeklyXP: 0,
    monthlyXP: 0,
    lastStudyDate: undefined,
    studyHistory: [],
    streakFreezeAvailable: false
  };

  // Calcular streak real
  const realStreak = calculateStreak(profile.lastStudyDate, profile.studyHistory);
  const streakAtRisk = isStreakAtRisk(profile.lastStudyDate);
  const streakFreezeCost = getStreakFreezeCost(realStreak);

  // Calcular conquistas desbloqueadas
  const unlockedAchievements = getUnlockedAchievements(completedLessons, quizAnswers, profile.totalXP);

  // Atualizar perfil quando dados mudam
  useEffect(() => {
    const totalXP = calculateTotalXP(completedLessons, quizAnswers, realStreak);
    const level = calculateLevel(totalXP);
    const levelProgress = calculateLevelProgress(totalXP, level);
    
    // Calcular XP semanal e mensal baseado no histórico de estudo
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const weeklyXP = profile.studyHistory
      .filter(date => date >= oneWeekAgo)
      .length * 10; // 10 XP por dia de estudo
    
    const monthlyXP = profile.studyHistory
      .filter(date => date >= oneMonthAgo)
      .length * 10; // 10 XP por dia de estudo
    
    updateGamificationProfile({
      totalXP,
      currentLevel: level,
      levelProgress,
      streak: realStreak,
      longestStreak: Math.max(profile.longestStreak, realStreak),
      achievements: unlockedAchievements.map(a => a.id),
      weeklyXP,
      monthlyXP
    });

    // Atualizar sessão de analytics com atividades completadas
    if (currentSessionId) {
      const activitiesCompleted = Object.keys(completedLessons).length;
      const quizzesCompleted = Object.keys(quizAnswers).length;
      const quizScores = Object.values(quizAnswers);
      const averageScore = quizScores.length > 0 
        ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length 
        : 0;
      
      updateSessionActivity(currentSessionId, activitiesCompleted, quizzesCompleted, averageScore);
    }
  }, [completedLessons, quizAnswers, userId, realStreak, currentSessionId]);

  // Solicitar permissão de notificação e verificar risco de streak
  useEffect(() => {
    requestNotificationPermission();
    
    if (profile.lastStudyDate) {
      checkStreakRisk(profile.lastStudyDate, realStreak);
    }
  }, [profile.lastStudyDate, realStreak]);

  // Registrar sessão de estudo quando usuário interage
  const handleStudySession = () => {
    recordStudySession();
  };

  return (
    <div className="gamification-system bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 p-2 sm:p-3 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 items-start">
        
        {/* Coluna Esquerda: Perfil, Conquistas e Leaderboard */}
        <div className="space-y-2 sm:space-y-3 flex flex-col">
          {/* Perfil do Usuário */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-3 sm:p-4 shadow-md">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-orange-600 dark:text-orange-400">🏆 Seu Perfil</h3>
            <div className="text-center mb-2 sm:mb-3">
              <div className="text-3xl sm:text-4xl font-bold text-orange-500 dark:text-orange-400">Nível {profile.currentLevel}</div>
              <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{profile.totalXP} XP Total</div>
            </div>
            
            {/* Barra de Progresso */}
            <div className="mb-2 sm:mb-3">
              <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 mb-1">
                <span>Progresso Nível {profile.currentLevel}</span>
                <span>{Math.round(profile.levelProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${profile.levelProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Streak */}
            <div className={`rounded-lg p-2 mb-2 ${streakAtRisk ? 'bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-500' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
              <div className="flex items-center justify-center">
                <span className="text-lg sm:text-xl mr-2">🔥</span>
                <div>
                  <div className="font-bold text-orange-600 dark:text-orange-400 text-xs sm:text-sm">{realStreak} dias</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {streakAtRisk ? '⚠️ Estude hoje para manter!' : 'consecutivos'}
                  </div>
                </div>
              </div>
              {streakAtRisk && profile.streakFreezeAvailable && (
                <button 
                  onClick={handleStudySession}
                  className="mt-1 w-full text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded transition"
                >
                  Usar Streak Freeze (-{streakFreezeCost} XP)
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>📅 Recorde:</span>
                <span className="font-semibold">{profile.longestStreak} dias</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>📈 XP Semanal:</span>
                <span className="font-semibold">{profile.weeklyXP}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>📊 XP Mensal:</span>
                <span className="font-semibold">{profile.monthlyXP}</span>
              </div>
            </div>
          </div>

          {/* Conquistas */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-3 sm:p-4 shadow-md">
            <h3 className="text-base sm:text-lg font-bold mb-2 text-orange-600 dark:text-orange-400">🏅 Conquistas</h3>
            <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
              {unlockedAchievements.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-3">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xs">Complete aulas para desbloquear conquistas!</div>
                </div>
              ) : (
                unlockedAchievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className="p-2 rounded-lg border border-orange-300 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/30 transition-all"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">{achievement.title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{achievement.description}</div>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded">
                            +{achievement.xpReward} XP
                          </span>
                          <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded ml-1">
                            ✅
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              {unlockedAchievements.length} de 20 conquistas
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-3 sm:p-4 shadow-md relative">
            <h3 className="text-base sm:text-lg font-bold mb-2 text-orange-600 dark:text-orange-400">🥇 Leaderboard</h3>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <Link
                  key={entry.userId}
                  to={`/profile/${entry.userId}`}
                  className={`flex items-center p-2 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                    entry.userId === userId 
                      ? 'bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-300 dark:border-orange-500' 
                      : 'bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500'
                  }`}
                  onMouseEnter={() => setHoveredUser(entry)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold mr-2">
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">{entry.userName}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Nível {entry.level} • {entry.xp} XP • 🔥 {entry.streak}
                    </div>
                  </div>
                  {entry.userId === userId && (
                    <span className="text-xs bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">
                      VOCÊ
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Preview Card ao Hover */}
            {hoveredUser && (
              <div className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-64 border border-gray-200 dark:border-gray-600 top-0 right-0 mt-12">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
                    {hoveredUser.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-800 dark:text-white">{hoveredUser.userName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Rank #{hoveredUser.rank}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="text-lg font-bold text-orange-500">{hoveredUser.xp}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">XP</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="text-lg font-bold text-blue-500">{hoveredUser.level}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Nível</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="text-lg font-bold text-green-500">{hoveredUser.streak}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="text-lg font-bold text-purple-500">{hoveredUser.completedLessons || 0}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Aulas</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
                  Clique para ver perfil completo
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Desafios */}
        <div className="space-y-2 sm:space-y-3 flex flex-col h-full">
          {/* Desafios */}
          <ChallengesPanel />
        </div>
      </div>
    </div>
  );
};

export default GamificationSystem;
