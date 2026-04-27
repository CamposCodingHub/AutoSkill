import {
  StudySession,
  UserEngagementMetrics,
  LearningPattern,
  RetentionMetrics,
  AnalyticsDashboard
} from '../types/gamification';

// Armazenamento local de sessões de estudo (em produção, usar banco de dados)
let studySessions: StudySession[] = [];

// Iniciar uma nova sessão de estudo
export const startStudySession = (
  userId: string,
  moduleId?: number,
  lessonId?: string
): StudySession => {
  const session: StudySession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    startTime: new Date(),
    moduleId,
    lessonId,
    activitiesCompleted: 0,
    quizzesCompleted: 0,
    averageScore: 0
  };

  studySessions.push(session);
  
  // Salvar no localStorage
  saveSessionsToStorage();
  
  return session;
};

// Finalizar uma sessão de estudo
export const endStudySession = (sessionId: string): StudySession | null => {
  const sessionIndex = studySessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return null;

  const session = studySessions[sessionIndex];
  session.endTime = new Date();
  session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);

  studySessions[sessionIndex] = session;
  saveSessionsToStorage();

  return session;
};

// Atualizar atividades completadas na sessão
export const updateSessionActivity = (
  sessionId: string,
  activitiesCompleted: number,
  quizzesCompleted: number,
  averageScore: number
): void => {
  const session = studySessions.find(s => s.id === sessionId);
  if (!session) return;

  session.activitiesCompleted = activitiesCompleted;
  session.quizzesCompleted = quizzesCompleted;
  session.averageScore = averageScore;

  saveSessionsToStorage();
};

// Calcular métricas de engajamento do usuário
export const calculateUserEngagement = (userId: string): UserEngagementMetrics => {
  const userSessions = studySessions.filter(s => s.userId === userId);
  
  if (userSessions.length === 0) {
    return {
      userId,
      totalStudyTime: 0,
      averageSessionDuration: 0,
      sessionsCount: 0,
      mostActiveHour: 0,
      mostActiveDay: 0,
      preferredModule: 0,
      completionRate: 0,
      engagementScore: 0
    };
  }

  const totalStudyTime = userSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageSessionDuration = totalStudyTime / userSessions.length;
  const sessionsCount = userSessions.length;

  // Calcular hora mais ativa
  const hourCounts = new Array(24).fill(0);
  userSessions.forEach(s => {
    const hour = s.startTime.getHours();
    hourCounts[hour]++;
  });
  const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Calcular dia mais ativo
  const dayCounts = new Array(7).fill(0);
  userSessions.forEach(s => {
    const day = s.startTime.getDay();
    dayCounts[day]++;
  });
  const mostActiveDay = dayCounts.indexOf(Math.max(...dayCounts));

  // Calcular módulo preferido
  const moduleCounts: Record<number, number> = {};
  userSessions.forEach(s => {
    if (s.moduleId) {
      moduleCounts[s.moduleId] = (moduleCounts[s.moduleId] || 0) + 1;
    }
  });
  const preferredModule = parseInt(Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '0');

  // Calcular taxa de conclusão
  const totalActivities = userSessions.reduce((sum, s) => sum + s.activitiesCompleted, 0);
  const totalQuizzes = userSessions.reduce((sum, s) => sum + s.quizzesCompleted, 0);
  const completionRate = totalActivities > 0 ? (totalQuizzes / totalActivities) * 100 : 0;

  // Calcular score de engajamento (0-100)
  const engagementScore = calculateEngagementScore(
    sessionsCount,
    averageSessionDuration,
    completionRate,
    mostActiveHour
  );

  return {
    userId,
    totalStudyTime,
    averageSessionDuration,
    sessionsCount,
    mostActiveHour,
    mostActiveDay,
    preferredModule,
    completionRate,
    engagementScore
  };
};

// Calcular score de engajamento
const calculateEngagementScore = (
  sessionsCount: number,
  avgDuration: number,
  completionRate: number,
  activeHour: number
): number => {
  let score = 0;

  // Frequência de sessões (até 30 pontos)
  score += Math.min(sessionsCount * 2, 30);

  // Duração média (até 30 pontos)
  const durationScore = Math.min(avgDuration / 60, 30); // 30 minutos = 30 pontos
  score += durationScore;

  // Taxa de conclusão (até 25 pontos)
  score += (completionRate / 100) * 25;

  // Horário ativo (até 15 pontos - bonus por estudar em horários produtivos)
  if (activeHour >= 9 && activeHour <= 17) {
    score += 15;
  } else if (activeHour >= 7 && activeHour <= 21) {
    score += 10;
  } else {
    score += 5;
  }

  return Math.min(Math.round(score), 100);
};

// Analisar padrões de aprendizado
export const analyzeLearningPattern = (userId: string): LearningPattern => {
  const userSessions = studySessions.filter(s => s.userId === userId);
  
  if (userSessions.length < 3) {
    return {
      userId,
      patternType: 'irregular',
      averageDailyStudyTime: 0,
      peakStudyHours: [],
      weakAreas: [],
      strongAreas: [],
      recommendedNextSteps: ['Complete mais sessões para análise']
    };
  }

  // Calcular tempo médio diário
  const totalStudyTime = userSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const daysSpanned = getDaysSpanned(userSessions);
  const averageDailyStudyTime = daysSpanned > 0 ? totalStudyTime / daysSpanned : 0;

  // Identificar horários de pico
  const hourCounts = new Array(24).fill(0);
  userSessions.forEach(s => {
    const hour = s.startTime.getHours();
    hourCounts[hour]++;
  });
  const peakStudyHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter(h => h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(h => h.hour);

  // Identificar áreas fracas e fortes
  const moduleScores: Record<number, number[]> = {};
  userSessions.forEach(s => {
    if (s.moduleId && s.averageScore > 0) {
      if (!moduleScores[s.moduleId]) moduleScores[s.moduleId] = [];
      moduleScores[s.moduleId].push(s.averageScore);
    }
  });

  const moduleAverages: Record<number, number> = {};
  Object.entries(moduleScores).forEach(([moduleId, scores]) => {
    moduleAverages[parseInt(moduleId)] = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  });

  const sortedModules = Object.entries(moduleAverages).sort((a, b) => a[1] - b[1]);
  const weakAreas = sortedModules.slice(0, 2).map(([id]) => parseInt(id));
  const strongAreas = sortedModules.slice(-2).map(([id]) => parseInt(id));

  // Determinar tipo de padrão
  const patternType = determinePatternType(userSessions, averageDailyStudyTime);

  // Recomendações
  const recommendedNextSteps = generateRecommendations(patternType, weakAreas, averageDailyStudyTime);

  return {
    userId,
    patternType,
    averageDailyStudyTime,
    peakStudyHours,
    weakAreas,
    strongAreas,
    recommendedNextSteps
  };
};

// Calcular dias entre primeira e última sessão
const getDaysSpanned = (sessions: StudySession[]): number => {
  if (sessions.length === 0) return 0;
  
  const dates = sessions.map(s => s.startTime.getTime()).sort((a, b) => a - b);
  const firstDate = new Date(dates[0]);
  const lastDate = new Date(dates[dates.length - 1]);
  
  return Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

// Determinar tipo de padrão
const determinePatternType = (
  sessions: StudySession[],
  avgDailyTime: number
): 'consistent' | 'burst' | 'declining' | 'irregular' => {
  if (sessions.length < 5) return 'irregular';

  const recentSessions = sessions.slice(-5);
  const olderSessions = sessions.slice(0, -5);

  const recentAvgDuration = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length;
  const olderAvgDuration = olderSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / olderSessions.length;

  if (avgDailyTime > 1800) { // Mais de 30 minutos por dia
    return 'consistent';
  } else if (recentAvgDuration > olderAvgDuration * 1.5) {
    return 'burst';
  } else if (recentAvgDuration < olderAvgDuration * 0.5) {
    return 'declining';
  } else {
    return 'irregular';
  }
};

// Gerar recomendações
const generateRecommendations = (
  patternType: string,
  weakAreas: number[],
  avgDailyTime: number
): string[] => {
  const recommendations: string[] = [];

  if (patternType === 'declining') {
    recommendations.push('Considere reduzir a carga diária para manter consistência');
    recommendations.push('Tente estudar no mesmo horário todos os dias');
  } else if (patternType === 'burst') {
    recommendations.push('Ótimo progresso! Mantenha o ritmo atual');
  } else if (patternType === 'irregular') {
    recommendations.push('Estabeleça um horário fixo para estudo');
    recommendations.push('Comece com sessões mais curtas e consistentes');
  }

  if (weakAreas.length > 0) {
    recommendations.push(`Foque nos módulos ${weakAreas.join(', ')} para melhorar`);
  }

  if (avgDailyTime < 900) { // Menos de 15 minutos
    recommendations.push('Aumente o tempo de estudo para pelo menos 15 minutos por dia');
  }

  return recommendations;
};

// Calcular métricas de retenção
export const calculateRetentionMetrics = (userId: string): RetentionMetrics => {
  const userSessions = studySessions.filter(s => s.userId === userId);
  
  if (userSessions.length === 0) {
    return {
      userId,
      firstSessionDate: new Date(),
      lastSessionDate: new Date(),
      daysActive: 0,
      retentionRate: 0,
      churnRisk: 'high',
      factors: {
        streakConsistency: 0,
        engagementTrend: 'decreasing',
        completionTrend: 'decreasing'
      }
    };
  }

  const firstSessionDate = userSessions[0].startTime;
  const lastSessionDate = userSessions[userSessions.length - 1].startTime;

  const daysSpanned = getDaysSpanned(userSessions);
  const daysActive = new Set(userSessions.map(s => s.startTime.toDateString())).size;
  const retentionRate = daysSpanned > 0 ? (daysActive / daysSpanned) * 100 : 0;

  // Calcular risco de churn
  const churnRisk = calculateChurnRisk(retentionRate, lastSessionDate);

  // Calcular fatores
  const factors = {
    streakConsistency: calculateStreakConsistency(userSessions),
    engagementTrend: calculateTrend(userSessions.map(s => s.duration || 0)),
    completionTrend: calculateTrend(userSessions.map(s => s.averageScore))
  };

  // Prever data de churn se risco for alto
  let predictedChurnDate: Date | undefined;
  if (churnRisk === 'high') {
    predictedChurnDate = new Date(lastSessionDate);
    predictedChurnDate.setDate(predictedChurnDate.getDate() + 7);
  }

  return {
    userId,
    firstSessionDate,
    lastSessionDate,
    daysActive,
    retentionRate,
    churnRisk,
    predictedChurnDate,
    factors
  };
};

// Calcular risco de churn
const calculateChurnRisk = (
  retentionRate: number,
  lastSessionDate: Date
): 'low' | 'medium' | 'high' => {
  const daysSinceLastSession = Math.floor((Date.now() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));

  if (retentionRate > 70 && daysSinceLastSession < 3) {
    return 'low';
  } else if (retentionRate > 50 && daysSinceLastSession < 7) {
    return 'medium';
  } else {
    return 'high';
  }
};

// Calcular consistência de streak
const calculateStreakConsistency = (sessions: StudySession[]): number => {
  if (sessions.length < 2) return 0;

  const dates = sessions.map(s => s.startTime.toDateString());
  const uniqueDates = new Set(dates);
  
  return (uniqueDates.size / sessions.length) * 100;
};

// Calcular tendência (crescente/estável/decrescente)
const calculateTrend = (values: number[]): 'increasing' | 'stable' | 'decreasing' => {
  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

  const diff = (secondAvg - firstAvg) / firstAvg;

  if (diff > 0.1) return 'increasing';
  if (diff < -0.1) return 'decreasing';
  return 'stable';
};

// Gerar dashboard de analytics
export const generateAnalyticsDashboard = (): AnalyticsDashboard => {
  const uniqueUsers = new Set(studySessions.map(s => s.userId));
  const totalUsers = uniqueUsers.size;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const activeUsersToday = new Set(
    studySessions
      .filter(s => s.startTime >= today)
      .map(s => s.userId)
  ).size;

  const activeUsersWeek = new Set(
    studySessions
      .filter(s => s.startTime >= weekAgo)
      .map(s => s.userId)
  ).size;

  const activeUsersMonth = new Set(
    studySessions
      .filter(s => s.startTime >= monthAgo)
      .map(s => s.userId)
  ).size;

  const totalStudyTime = studySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageSessionDuration = studySessions.length > 0 
    ? totalStudyTime / studySessions.length 
    : 0;

  // Calcular engajamento médio
  const engagementScores = Array.from(uniqueUsers).map(userId => 
    calculateUserEngagement(userId).engagementScore
  );
  const averageEngagementScore = engagementScores.length > 0
    ? engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length
    : 0;

  // Calcular retenção média
  const retentionRates = Array.from(uniqueUsers).map(userId =>
    calculateRetentionMetrics(userId).retentionRate
  );
  const averageRetentionRate = retentionRates.length > 0
    ? retentionRates.reduce((sum, rate) => sum + rate, 0) / retentionRates.length
    : 0;

  // Identificar usuários em risco
  const atRiskUsers = Array.from(uniqueUsers).filter(userId =>
    calculateRetentionMetrics(userId).churnRisk === 'high'
  );

  return {
    overview: {
      totalUsers,
      activeUsersToday,
      activeUsersWeek,
      activeUsersMonth,
      averageSessionDuration,
      totalStudyTime
    },
    engagement: {
      averageEngagementScore,
      topEngagedUsers: Array.from(uniqueUsers)
        .map(userId => ({ userId, score: calculateUserEngagement(userId).engagementScore }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(u => u.userId),
      mostPopularModules: [], // Seria calculado com dados de módulos
      peakHours: [] // Seria calculado com dados de horários
    },
    retention: {
      averageRetentionRate,
      churnRate: 100 - averageRetentionRate,
      atRiskUsers,
      returningUsers: activeUsersWeek - activeUsersToday
    },
    learning: {
      averageCompletionRate: 0, // Seria calculado com dados de quizzes
      fastestCompleters: [],
      commonWeakAreas: [],
      averageTimePerModule: 0
    }
  };
};

// Salvar sessões no localStorage
const saveSessionsToStorage = (): void => {
  try {
    localStorage.setItem('autoskill_study_sessions', JSON.stringify(studySessions));
  } catch (error) {
    console.error('Erro ao salvar sessões:', error);
  }
};

// Carregar sessões do localStorage
export const loadSessionsFromStorage = (): void => {
  try {
    const stored = localStorage.getItem('autoskill_study_sessions');
    if (stored) {
      studySessions = JSON.parse(stored);
      // Converter strings de data para objetos Date
      studySessions = studySessions.map(s => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar sessões:', error);
  }
};

// Limpar sessões antigas (mais de 90 dias)
export const cleanupOldSessions = (): void => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  studySessions = studySessions.filter(s => s.startTime >= ninetyDaysAgo);
  saveSessionsToStorage();
};
