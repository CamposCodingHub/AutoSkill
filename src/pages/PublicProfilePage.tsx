import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { authAPI } from '../services/api';

interface GamificationData {
  totalXP: number;
  currentLevel: number;
  levelProgress: number;
  streak: number;
  longestStreak: number;
  achievements: string[];
  weeklyXP: number;
  monthlyXP: number;
}

interface ProgressData {
  completedLessons: Record<string, boolean>;
}

interface PublicProfileData {
  user: {
    id: string;
    name: string;
    bio: string | null;
    avatar: string | null;
    role: string;
    createdAt: string;
  };
  gamification: GamificationData | null;
  progress: ProgressData | null;
}

export default function PublicProfilePage() {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      try {
        const data = await authAPI.getPublicProfile(userId);
        setProfileData(data);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">Carregando perfil...</div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500">Perfil não encontrado</h1>
          <Link to="/" className="text-orange-500 underline mt-4 inline-block">Voltar para o início</Link>
        </div>
      </Layout>
    );
  }

  const { user, gamification, progress } = profileData;
  const completedLessonsCount = progress ? Object.values(progress.completedLessons).filter(Boolean).length : 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
        <div className="mb-4">
          <Link to="/" className="text-orange-500 hover:underline text-sm sm:text-base">← Voltar para o início</Link>
        </div>

        {/* Header do Perfil */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 sm:p-8 mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-orange-500 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-orange-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold border-4 border-orange-600 shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {user.role === 'admin' && (
                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                  ADMIN
                </div>
              )}
            </div>

            {/* Info Básica */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{user.name}</h1>
              {user.bio && (
                <p className="text-gray-300 text-sm sm:text-base mb-3">{user.bio}</p>
              )}
              <p className="text-gray-400 text-xs sm:text-sm">
                Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas de Gamificação */}
        {gamification && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-500">{gamification.totalXP}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">XP Total</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-500">{gamification.currentLevel}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Nível</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-500">{gamification.streak}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Streak</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-500">{completedLessonsCount}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Aulas</div>
            </div>
          </div>
        )}

        {/* Progresso de Nível */}
        {gamification && (
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Progresso do Nível</h3>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Nível {gamification.currentLevel}</span>
              <span>{gamification.levelProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${gamification.levelProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Conquistas */}
        {gamification && gamification.achievements.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">🏆 Conquistas</h3>
            <div className="flex flex-wrap gap-2">
              {gamification.achievements.map((achievement, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* XP Semanal e Mensal */}
        {gamification && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">📈 XP Semanal</h3>
              <div className="text-2xl font-bold text-blue-500">{gamification.weeklyXP} XP</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">📊 XP Mensal</h3>
              <div className="text-2xl font-bold text-green-500">{gamification.monthlyXP} XP</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
