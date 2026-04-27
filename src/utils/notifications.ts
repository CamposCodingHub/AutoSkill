// Sistema de notificações para lembretes de streak

// Solicitar permissão para notificações
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Enviar notificação de lembrete de streak
export const sendStreakReminder = (streakDays: number): void => {
  if (Notification.permission !== 'granted') {
    return;
  }

  const messages = [
    '🔥 Não perca seu streak! Estude hoje para manter sua sequência!',
    '⚡ Sua sequência está em risco! Complete uma aula agora.',
    '🎯 Você está indo bem! Continue estudando para manter seu streak.',
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  new Notification('AutoSkill - Lembrete de Streak', {
    body: `${randomMessage} Streak atual: ${streakDays} dias`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'streak-reminder',
    requireInteraction: true,
  });
};

// Enviar notificação de conquista desbloqueada
export const sendAchievementUnlock = (achievementTitle: string, xpReward: number): void => {
  if (Notification.permission !== 'granted') {
    return;
  }

  new Notification('🏅 Nova Conquista Desbloqueada!', {
    body: `Você desbloqueou: ${achievementTitle} (+${xpReward} XP)`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'achievement-unlock',
    requireInteraction: false,
  });
};

// Enviar notificação de nível alcançado
export const sendLevelUp = (newLevel: number): void => {
  if (Notification.permission !== 'granted') {
    return;
  }

  new Notification('🎉 Parabéns! Você subiu de nível!', {
    body: `Você alcançou o nível ${newLevel}! Continue assim!`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'level-up',
    requireInteraction: true,
  });
};

// Agendar notificação de lembrete diário
export const scheduleDailyReminder = (streakDays: number): void => {
  // Limpar notificações anteriores
  if (window.streakTimeout) {
    clearTimeout(window.streakTimeout);
  }

  // Agendar para 24 horas depois
  const twentyFourHours = 24 * 60 * 60 * 1000;
  window.streakTimeout = setTimeout(() => {
    sendStreakReminder(streakDays);
  }, twentyFourHours);
};

// Cancelar notificações agendadas
export const cancelScheduledReminders = (): void => {
  if (window.streakTimeout) {
    clearTimeout(window.streakTimeout);
  }
};

// Verificar se o streak está em risco e enviar notificação
export const checkStreakRisk = (lastStudyDate: Date | undefined, streakDays: number): void => {
  if (!lastStudyDate) {
    return;
  }

  const now = new Date();
  const lastDate = new Date(lastStudyDate);
  const diffTime = now.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Se estudou ontem, enviar lembrete para hoje
  if (diffDays === 1) {
    sendStreakReminder(streakDays);
  }
};

// Enviar notificação de desafio completado
export const sendChallengeComplete = (challengeTitle: string, xpReward: number, challengeType: string): void => {
  if (Notification.permission !== 'granted') {
    return;
  }

  const typeEmoji = challengeType === 'daily' ? '📅' : challengeType === 'weekly' ? '📆' : '🗓️';

  new Notification(`${typeEmoji} Desafio Completado!`, {
    body: `Você completou: ${challengeTitle} (+${xpReward} XP)`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'challenge-complete',
    requireInteraction: false,
  });
};

// Enviar notificação de progresso em desafio
export const sendChallengeProgress = (challengeTitle: string, progress: number): void => {
  if (Notification.permission !== 'granted' || progress < 50) {
    return;
  }

  new Notification('📈 Progresso de Desafio', {
    body: `${challengeTitle}: ${Math.round(progress)}% completo! Continue assim!`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'challenge-progress',
    requireInteraction: false,
  });
};

// Extensão da interface Window para armazenar timeouts
declare global {
  interface Window {
    streakTimeout?: ReturnType<typeof setTimeout>;
  }
}
