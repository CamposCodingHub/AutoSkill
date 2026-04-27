import { Achievement, Challenge } from '../types/gamification';

// Valores de XP por atividade
export const XP_VALUES = {
  lessonComplete: 50,
  quizPerfect: 30,
  quizGood: 20,
  dailyStreak: 25,
  weeklyChallenge: 100,
  achievementUnlock: 75,
  moduleComplete: 200,
  streakMultiplier: 1.5
} as const;

// XP necessário por nível
export const XP_PER_LEVEL = 100;

// Calcular nível baseado em XP total
export const calculateLevel = (totalXP: number): number => {
  return Math.floor(Math.sqrt(totalXP / XP_PER_LEVEL)) + 1;
};

// Calcular XP necessário para próximo nível
export const getXPForNextLevel = (currentLevel: number): number => {
  return Math.pow(currentLevel, 2) * XP_PER_LEVEL;
};

// Calcular progresso no nível atual (0-100)
export const calculateLevelProgress = (totalXP: number, currentLevel: number): number => {
  const currentLevelXP = Math.pow(currentLevel - 1, 2) * XP_PER_LEVEL;
  const nextLevelXP = Math.pow(currentLevel, 2) * XP_PER_LEVEL;
  return ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
};

// Verificar se uma conquista deve ser desbloqueada
const checkAchievementUnlock = (
  achievement: Achievement,
  completedLessons: Record<string, boolean>,
  quizAnswers: Record<string, number>,
  totalXP: number
): boolean => {
  switch (achievement.id) {
    // Badges Básicos
    case 'first_multimeter':
      return Object.keys(completedLessons).length >= 1;
    
    case 'ohm_law_master':
      const basicQuizzes = Object.keys(quizAnswers).filter(key => key.includes('1-'));
      // Nota: quizAnswers agora salva o índice da resposta do usuário, não se está correto
      // A verificação de acertos precisa ser feita de forma diferente
      return basicQuizzes.length >= 5;
    
    case 'circuit_warrior':
      const module1Lessons = Object.keys(completedLessons).filter(key => key.startsWith('1-'));
      return module1Lessons.length >= 10;
    
    case 'voltage_master':
      return Object.keys(completedLessons).length >= 10;

    // Badges Intermediários
    case 'can_bus_explorer':
      const canQuizzes = Object.keys(quizAnswers).filter(key => key.includes('8-'));
      return canQuizzes.length >= 5;
    
    case 'sensor_specialist':
      const sensorQuizzes = Object.keys(quizAnswers).filter(key => key.includes('3-') || key.includes('4-'));
      // Simplificado - apenas verifica quantidade de quizzes respondidos
      return sensorQuizzes.length >= 10;
    
    case 'injection_master':
      const module5Lessons = Object.keys(completedLessons).filter(key => key.startsWith('5-'));
      return module5Lessons.length >= 7;
    
    case 'oscilloscope_novice':
      const module16Lessons = Object.keys(completedLessons).filter(key => key.startsWith('16-'));
      return module16Lessons.length >= 5;
    
    case 'streak_7':
      return totalXP >= 500; // Simplificado - virá do streak real
    
    case 'streak_30':
      return totalXP >= 2000; // Simplificado - virá do streak real

    // Badges Avançados
    case 'diagnostic_master':
      const diagnosticQuizzes = Object.keys(quizAnswers).length;
      // Simplificado - apenas verifica quantidade de quizzes respondidos
      return diagnosticQuizzes >= 50;
    
    case 'network_pro':
      const networkLessons = Object.keys(completedLessons).filter(key => 
        key.startsWith('8-') || key.startsWith('9-')
      );
      return networkLessons.length >= 14;
    
    case 'hybrid_expert':
      const hybridLessons = Object.keys(completedLessons).filter(key => key.startsWith('11-'));
      return hybridLessons.length >= 7;
    
    case 'ev_specialist':
      const evLessons = Object.keys(completedLessons).filter(key => key.startsWith('15-'));
      return evLessons.length >= 7;
    
    case 'streak_100':
      return totalXP >= 5000; // Simplificado - virá do streak real

    // Badges Especialista
    case 'module_complete_1':
      const basicModules = Object.keys(completedLessons).filter(key => {
        const moduleId = parseInt(key.split('-')[0]);
        return moduleId >= 1 && moduleId <= 6;
      });
      return basicModules.length >= 40;
    
    case 'module_complete_2':
      const intermediateModules = Object.keys(completedLessons).filter(key => {
        const moduleId = parseInt(key.split('-')[0]);
        return moduleId >= 7 && moduleId <= 19;
      });
      return intermediateModules.length >= 80;
    
    case 'module_complete_3':
      const advancedModules = Object.keys(completedLessons).filter(key => {
        const moduleId = parseInt(key.split('-')[0]);
        return moduleId >= 20 && moduleId <= 29;
      });
      return advancedModules.length >= 50;
    
    case 'perfect_quiz_master':
      const perfectQuizzes = Object.keys(quizAnswers).length;
      // Simplificado - apenas verifica quantidade de quizzes respondidos
      return perfectQuizzes >= 100;
    
    case 'autoskill_master':
      return Object.keys(completedLessons).length >= 200;
    
    default:
      return false;
  }
};

// Calcular streak de dias consecutivos
export const calculateStreak = (lastStudyDate?: Date, studyHistory?: Date[]): number => {
  if (!lastStudyDate || !studyHistory || studyHistory.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastDate = new Date(lastStudyDate);
  lastDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Se estudou hoje, calcula o streak
  if (diffDays === 0) {
    return calculateConsecutiveDays(studyHistory);
  }
  
  // Se estudou ontem, mantém o streak
  if (diffDays === 1) {
    return calculateConsecutiveDays(studyHistory);
  }
  
  // Se passou mais de 1 dia, streak quebrado
  return 0;
};

// Calcular dias consecutivos do histórico
const calculateConsecutiveDays = (studyHistory: Date[]): number => {
  if (studyHistory.length === 0) return 0;
  
  const sortedDates = studyHistory
    .map(date => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime())
    .map(date => {
      date.setHours(0, 0, 0, 0);
      return date;
    });
  
  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Verifica se estudou hoje ou ontem
  const diffToday = Math.floor((today.getTime() - sortedDates[0].getTime()) / (1000 * 60 * 60 * 24));
  if (diffToday > 1) return 0;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const current = sortedDates[i];
    const previous = sortedDates[i - 1];
    const diffDays = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Verificar se o streak está em risco (próximo de quebrar)
export const isStreakAtRisk = (lastStudyDate?: Date): boolean => {
  if (!lastStudyDate) return false;
  
  const today = new Date();
  const lastDate = new Date(lastStudyDate);
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1; // Estudou ontem, precisa estudar hoje
};

// Calcular XP necessário para Streak Freeze
export const getStreakFreezeCost = (currentStreak: number): number => {
  // Custo aumenta conforme o streak cresce
  if (currentStreak < 7) return 50;
  if (currentStreak < 30) return 100;
  if (currentStreak < 100) return 200;
  return 300;
};

// Calcular XP total do usuário
export const calculateTotalXP = (
  completedLessons: Record<string, boolean>,
  quizAnswers: Record<string, number>,
  streak: number
): number => {
  let totalXP = 0;
  
  // XP por aulas completas
  const completedCount = Object.keys(completedLessons).length;
  totalXP += completedCount * XP_VALUES.lessonComplete;
  
  // XP por quizzes (simplificado - XP por quiz respondido)
  const quizCount = Object.keys(quizAnswers).length;
  totalXP += quizCount * XP_VALUES.quizGood;
  
  // XP por streak
  totalXP += streak * XP_VALUES.dailyStreak;
  
  return totalXP;
};

// Definição de conquistas disponíveis
export const ACHIEVEMENTS: Achievement[] = [
  // Badges Básicos
  {
    id: 'first_multimeter',
    title: 'Primeiro Multímetro Virtual',
    description: 'Complete sua primeira simulação de medição elétrica',
    icon: '⚡',
    xpReward: 75,
    category: 'basic'
  },
  {
    id: 'ohm_law_master',
    title: 'Mestre da Lei de Ohm',
    description: 'Acerte 100% nos quizzes de circuitos básicos',
    icon: '🔬',
    xpReward: 100,
    category: 'basic'
  },
  {
    id: 'circuit_warrior',
    title: 'Guerreiro dos Circuitos',
    description: 'Complete todas as aulas do Módulo 1 com 100% de acertos',
    icon: '🔋',
    xpReward: 150,
    category: 'basic'
  },
  {
    id: 'voltage_master',
    title: 'Mestre da Tensão',
    description: 'Complete 10 medições de tensão com precisão',
    icon: '📊',
    xpReward: 120,
    category: 'basic'
  },

  // Badges Intermediários
  {
    id: 'can_bus_explorer',
    title: 'Explorador CAN Bus',
    description: 'Diagnostique com sucesso 5 problemas de comunicação CAN',
    icon: '🔌',
    xpReward: 150,
    category: 'intermediate'
  },
  {
    id: 'sensor_specialist',
    title: 'Especialista em Sensores',
    description: 'Complete todos os módulos de sensores com média >90%',
    icon: '📡',
    xpReward: 200,
    category: 'intermediate'
  },
  {
    id: 'injection_master',
    title: 'Mestre da Injeção',
    description: 'Complete o Módulo 5 com 95% de acertos',
    icon: '⛽',
    xpReward: 180,
    category: 'intermediate'
  },
  {
    id: 'oscilloscope_novice',
    title: 'Iniciante do Osciloscópio',
    description: 'Complete 5 simulações de osciloscópio',
    icon: '📈',
    xpReward: 160,
    category: 'intermediate'
  },
  {
    id: 'streak_7',
    title: 'Semana Incrível',
    description: 'Mantenha um streak de 7 dias consecutivos',
    icon: '🔥',
    xpReward: 100,
    category: 'intermediate'
  },
  {
    id: 'streak_30',
    title: 'Mês de Dedicação',
    description: 'Mantenha um streak de 30 dias consecutivos',
    icon: '🏆',
    xpReward: 300,
    category: 'intermediate'
  },

  // Badges Avançados
  {
    id: 'diagnostic_master',
    title: 'Mestre do Diagnóstico',
    description: 'Complete 50 diagnósticos com 95% de acertos',
    icon: '🔧',
    xpReward: 300,
    category: 'advanced'
  },
  {
    id: 'network_pro',
    title: 'Profissional de Redes',
    description: 'Complete todos os módulos de redes CAN/LIN',
    icon: '🌐',
    xpReward: 250,
    category: 'advanced'
  },
  {
    id: 'hybrid_expert',
    title: 'Especialista em Híbridos',
    description: 'Complete o módulo de veículos híbridos',
    icon: '�',
    xpReward: 280,
    category: 'advanced'
  },
  {
    id: 'ev_specialist',
    title: 'Especialista em Veículos Elétricos',
    description: 'Complete o módulo de alta tensão em BEVs',
    icon: '🔋',
    xpReward: 320,
    category: 'advanced'
  },
  {
    id: 'streak_100',
    title: 'Lenda da Consistência',
    description: 'Mantenha um streak de 100 dias consecutivos',
    icon: '👑',
    xpReward: 500,
    category: 'advanced'
  },

  // Badges Especialista
  {
    id: 'module_complete_1',
    title: 'Graduado em Elétrica Básica',
    description: 'Complete todos os módulos 1-6',
    icon: '🎓',
    xpReward: 400,
    category: 'expert'
  },
  {
    id: 'module_complete_2',
    title: 'Graduado em Diagnóstico',
    description: 'Complete todos os módulos 7-19',
    icon: '🎓',
    xpReward: 600,
    category: 'expert'
  },
  {
    id: 'module_complete_3',
    title: 'Graduado em Sistemas Avançados',
    description: 'Complete todos os módulos 20-29',
    icon: '🎓',
    xpReward: 800,
    category: 'expert'
  },
  {
    id: 'perfect_quiz_master',
    title: 'Mestre dos Quizzes Perfeitos',
    description: 'Acerte 100 quizzes com 100% de precisão',
    icon: '💯',
    xpReward: 500,
    category: 'expert'
  },
  {
    id: 'autoskill_master',
    title: 'Mestre AutoSkill',
    description: 'Complete TODOS os módulos do curso',
    icon: '🏅',
    xpReward: 1000,
    category: 'expert'
  }
];

// Obter conquistas desbloqueadas
export const getUnlockedAchievements = (
  completedLessons: Record<string, boolean>,
  quizAnswers: Record<string, number>,
  totalXP: number
): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement =>
    checkAchievementUnlock(achievement, completedLessons, quizAnswers, totalXP)
  );
};

// Gerar desafios diários
export const generateDailyChallenges = (): Challenge[] => {
  const today = new Date();
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return [
    {
      id: `daily-${today.getTime()}-1`,
      title: 'Estudante Diário',
      description: 'Complete 3 aulas hoje',
      type: 'daily',
      xpReward: 50,
      requirements: { lessonsCompleted: 3 },
      endDate: endOfDay,
      isActive: true
    },
    {
      id: `daily-${today.getTime()}-2`,
      title: 'Quiz Perfeito',
      description: 'Acerte 100% em 2 quizzes',
      type: 'daily',
      xpReward: 40,
      requirements: { averageScore: 100 },
      endDate: endOfDay,
      isActive: true
    },
    {
      id: `daily-${today.getTime()}-3`,
      title: 'Streak Mantido',
      description: 'Mantenha seu streak ativo',
      type: 'daily',
      xpReward: 25,
      requirements: { streakDays: 1 },
      endDate: endOfDay,
      isActive: true
    }
  ];
};

// Gerar desafios semanais
export const generateWeeklyChallenges = (): Challenge[] => {
  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  return [
    {
      id: `weekly-${today.getTime()}-1`,
      title: 'Maratonista Semanal',
      description: 'Complete 15 aulas esta semana',
      type: 'weekly',
      xpReward: 200,
      requirements: { lessonsCompleted: 15 },
      endDate: endOfWeek,
      isActive: true
    },
    {
      id: `weekly-${today.getTime()}-2`,
      title: 'Consistência',
      description: 'Estude 5 dias consecutivos',
      type: 'weekly',
      xpReward: 150,
      requirements: { streakDays: 5 },
      endDate: endOfWeek,
      isActive: true
    },
    {
      id: `weekly-${today.getTime()}-3`,
      title: 'Mestre dos Quizzes',
      description: 'Média de 90% em 10 quizzes',
      type: 'weekly',
      xpReward: 180,
      requirements: { averageScore: 90 },
      endDate: endOfWeek,
      isActive: true
    }
  ];
};

// Gerar desafios mensais
export const generateMonthlyChallenges = (): Challenge[] => {
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return [
    {
      id: `monthly-${today.getTime()}-1`,
      title: 'Desafio do Mês',
      description: 'Complete 50 aulas este mês',
      type: 'monthly',
      xpReward: 500,
      requirements: { lessonsCompleted: 50 },
      endDate: endOfMonth,
      isActive: true
    },
    {
      id: `monthly-${today.getTime()}-2`,
      title: 'Lenda do Streak',
      description: 'Mantenha streak de 20 dias',
      type: 'monthly',
      xpReward: 400,
      requirements: { streakDays: 20 },
      endDate: endOfMonth,
      isActive: true
    }
  ];
};

// Obter todos os desafios ativos
export const getActiveChallenges = (): Challenge[] => {
  return [
    ...generateDailyChallenges(),
    ...generateWeeklyChallenges(),
    ...generateMonthlyChallenges()
  ];
};

// Verificar se um desafio foi completado
export const checkChallengeCompletion = (
  challenge: Challenge,
  completedLessons: Record<string, boolean>,
  quizAnswers: Record<string, number>,
  currentStreak: number
): boolean => {
  const { requirements } = challenge;

  if (requirements.lessonsCompleted) {
    const completedCount = Object.keys(completedLessons).length;
    if (completedCount < requirements.lessonsCompleted) return false;
  }

  if (requirements.averageScore) {
    const quizScores = Object.values(quizAnswers);
    if (quizScores.length === 0) return false;
    const average = quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length;
    if (average < requirements.averageScore) return false;
  }

  if (requirements.streakDays) {
    if (currentStreak < requirements.streakDays) return false;
  }

  return true;
};

// Calcular progresso de um desafio (0-100)
export const calculateChallengeProgress = (
  challenge: Challenge,
  completedLessons: Record<string, boolean>,
  quizAnswers: Record<string, number>,
  currentStreak: number
): number => {
  const { requirements } = challenge;

  if (requirements.lessonsCompleted) {
    const completedCount = Object.keys(completedLessons).length;
    return Math.min((completedCount / requirements.lessonsCompleted) * 100, 100);
  }

  if (requirements.averageScore) {
    const quizScores = Object.values(quizAnswers);
    if (quizScores.length === 0) return 0;
    const average = quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length;
    return Math.min((average / requirements.averageScore) * 100, 100);
  }

  if (requirements.streakDays) {
    return Math.min((currentStreak / requirements.streakDays) * 100, 100);
  }

  return 0;
};
