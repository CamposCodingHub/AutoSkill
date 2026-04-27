import { Recommendation, UserBehavior, LeaderboardEntry } from '../types/gamification';

// Dados mock de comportamento do usuário
const mockUserBehavior: UserBehavior = {
  userId: 'user-1',
  completedLessons: [1, 2, 3],
  completedMicroLessons: ['micro-1', 'micro-2'],
  completedChallenges: ['daily-1', 'weekly-1'],
  interests: ['motor', 'elétrica', 'diagnóstico'],
  skillLevel: 'beginner',
  timeSpent: {
    1: 45,
    2: 30,
    3: 60
  },
  lastActive: new Date()
};

// Dados mock do leaderboard
const mockLeaderboard: LeaderboardEntry[] = [
  { userId: 'user-1', userName: 'João Silva', xp: 2500, level: 5, streak: 7, completedLessons: 12, completedChallenges: 8, rank: 1, change: 0 },
  { userId: 'user-2', userName: 'Maria Santos', xp: 2300, level: 4, streak: 5, completedLessons: 10, completedChallenges: 7, rank: 2, change: 1 },
  { userId: 'user-3', userName: 'Pedro Costa', xp: 2100, level: 4, streak: 3, completedLessons: 9, completedChallenges: 6, rank: 3, change: -1 },
  { userId: 'user-4', userName: 'Ana Lima', xp: 1900, level: 3, streak: 10, completedLessons: 8, completedChallenges: 5, rank: 4, change: 2 },
  { userId: 'user-5', userName: 'Carlos Souza', xp: 1800, level: 3, streak: 2, completedLessons: 7, completedChallenges: 4, rank: 5, change: 0 }
];

// Obter comportamento do usuário
export const getUserBehavior = (userId: string): UserBehavior => {
  // Em produção, buscaria do backend
  return mockUserBehavior;
};

// Gerar recomendações baseadas no comportamento
export const generateRecommendations = (userId: string): Recommendation[] => {
  const behavior = getUserBehavior(userId);
  const recommendations: Recommendation[] = [];

  // Recomendar próxima aula baseada no progresso
  const nextLesson = behavior.completedLessons.length + 1;
  if (nextLesson <= 29) {
    recommendations.push({
      id: `rec-lesson-${Date.now()}`,
      type: 'lesson',
      itemId: nextLesson.toString(),
      title: `Módulo ${nextLesson}: Continuar seu progresso`,
      description: 'Você completou os módulos anteriores. Continue com o próximo módulo.',
      reason: 'Baseado no seu progresso atual',
      confidence: 90,
      category: 'lessons',
      priority: 'high'
    });
  }

  // Recomendar micro-aulas baseadas em interesses
  if (behavior.interests.includes('motor')) {
    recommendations.push({
      id: `rec-micro-${Date.now()}`,
      type: 'microlesson',
      itemId: 'micro-1',
      title: 'Micro-aula: Fundamentos de Motor',
      description: 'Aprenda os conceitos básicos de motores em 5 minutos.',
      reason: 'Você tem interesse em motores',
      confidence: 85,
      category: 'microlearning',
      priority: 'medium'
    });
  }

  // Recomendar desafios baseados no nível
  if (behavior.skillLevel === 'beginner') {
    recommendations.push({
      id: `rec-challenge-${Date.now()}`,
      type: 'challenge',
      itemId: 'daily-2',
      title: 'Desafio Diário: Primeiros Passos',
      description: 'Complete este desafio para ganhar XP e desbloquear conquistas.',
      reason: 'Desafio adequado para seu nível',
      confidence: 80,
      category: 'gamification',
      priority: 'medium'
    });
  }

  // Recomendar certificação quando tiver módulos suficientes
  if (behavior.completedLessons.length >= 3) {
    recommendations.push({
      id: `rec-cert-${Date.now()}`,
      type: 'certification',
      itemId: 'cert-electrical-basic',
      title: 'Certificação: Elétrica Básica',
      description: 'Você já completou os módulos necessários. Obtenha sua certificação!',
      reason: 'Elegível para certificação',
      confidence: 95,
      category: 'certifications',
      priority: 'high'
    });
  }

  // Recomendar mentor baseado em interesses
  if (behavior.interests.includes('diagnóstico')) {
    recommendations.push({
      id: `rec-mentor-${Date.now()}`,
      type: 'mentor',
      itemId: 'mentor-1',
      title: 'Mentoria: Carlos Silva',
      description: 'Especialista em diagnóstico com 15 anos de experiência.',
      reason: 'Alinhado com seus interesses',
      confidence: 75,
      category: 'mentorship',
      priority: 'low'
    });
  }

  // Recomendar caminho de aprendizado
  recommendations.push({
    id: `rec-path-${Date.now()}`,
    type: 'path',
    itemId: 'path-1',
    title: 'Caminho: Fundamentos de Motor',
    description: 'Siga este caminho estruturado para dominar motores.',
    reason: 'Caminho recomendado para seu nível',
    confidence: 70,
    category: 'microlearning',
    priority: 'medium'
  });

  // Ordenar por confiança e prioridade
  return recommendations.sort((a, b) => {
    const priorityScore = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityScore[b.priority] - priorityScore[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  }).slice(0, 5);
};

// Obter leaderboard global
export const getGlobalLeaderboard = (): LeaderboardEntry[] => {
  return mockLeaderboard.sort((a, b) => b.xp - a.xp);
};

// Obter leaderboard por categoria
export const getLeaderboardByCategory = (category: 'xp' | 'streak' | 'lessons' | 'challenges'): LeaderboardEntry[] => {
  const sorted = [...mockLeaderboard];
  
  switch (category) {
    case 'xp':
      return sorted.sort((a, b) => b.xp - a.xp);
    case 'streak':
      return sorted.sort((a, b) => b.streak - a.streak);
    case 'lessons':
      return sorted.sort((a, b) => b.completedLessons - a.completedLessons);
    case 'challenges':
      return sorted.sort((a, b) => b.completedChallenges - a.completedChallenges);
    default:
      return sorted;
  }
};

// Obter posição do usuário no ranking
export const getUserRank = (userId: string): number => {
  const leaderboard = getGlobalLeaderboard();
  const userEntry = leaderboard.find(entry => entry.userId === userId);
  return userEntry?.rank || 0;
};

// Calcular mudança no ranking
export const calculateRankChange = (userId: string): number => {
  const leaderboard = getGlobalLeaderboard();
  const userEntry = leaderboard.find(entry => entry.userId === userId);
  return userEntry?.change || 0;
};

// Obter top N usuários
export const getTopUsers = (limit: number = 10): LeaderboardEntry[] => {
  return getGlobalLeaderboard().slice(0, limit);
};

// Obter usuários próximos ao ranking do usuário
export const getNearbyUsers = (userId: string, range: number = 2): LeaderboardEntry[] => {
  const leaderboard = getGlobalLeaderboard();
  const userRank = getUserRank(userId);
  
  return leaderboard.filter(entry => {
    const rankDiff = Math.abs(entry.rank - userRank);
    return rankDiff <= range && entry.userId !== userId;
  });
};
