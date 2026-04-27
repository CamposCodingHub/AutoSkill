const API_BASE_URL = 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Progress {
  id: string;
  userId: string;
  completedLessons: Record<string, boolean>;
  quizAnswers: Record<string, number>;
  lessonQuizProgress: Record<string, { answered: number; correct: number; total: number }>;
  updatedAt: string;
}

export interface GamificationProfile {
  id: string;
  userId: string;
  totalXP: number;
  currentLevel: number;
  levelProgress: number;
  streak: number;
  longestStreak: number;
  achievements: string[];
  weeklyXP: number;
  monthlyXP: number;
  lastStudyDate: string | null;
  studyHistory: string[];
  streakFreezeAvailable: boolean;
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  xp: number;
  level: number;
  streak: number;
  completedLessons?: number;
  completedChallenges?: number;
  change?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Helper para fazer requisições com token
const getAuthHeaders = () => {
  const token = localStorage.getItem('autoskill_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password, name }),
    });
    if (!response.ok) throw new Error('Erro ao registrar');
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Erro ao fazer login');
    return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar usuário');
    return response.json();
  },

  updateProfile: async (data: { name?: string; bio?: string; avatar?: string; phone?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao atualizar perfil');
    return response.json();
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao alterar senha');
    return response.json();
  },

  getPublicProfile: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`);
    if (!response.ok) throw new Error('Erro ao buscar perfil público');
    return response.json();
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar usuários');
    return response.json();
  },

  deleteUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao deletar usuário');
    return response.json();
  },

  updateUser: async (userId: string, data: { name?: string; role?: string; bio?: string; avatar?: string; phone?: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao atualizar usuário');
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('autoskill_token');
    localStorage.removeItem('autoskill_user');
  },
};

// Progress API
export const progressAPI = {
  getProgress: async (): Promise<Progress> => {
    const response = await fetch(`${API_BASE_URL}/progress`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar progresso');
    return response.json();
  },

  updateLessonProgress: async (moduleId: number, lessonId: number, completed: boolean): Promise<Progress> => {
    const response = await fetch(`${API_BASE_URL}/progress/lessons/${moduleId}/${lessonId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) throw new Error('Erro ao atualizar progresso');
    return response.json();
  },

  saveQuizAnswer: async (moduleId: number, lessonId: number, answerIndex: number, correctIndex: number, totalQuizzes: number): Promise<Progress> => {
    const response = await fetch(`${API_BASE_URL}/progress/quiz`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ moduleId, lessonId, answerIndex, correctIndex, totalQuizzes }),
    });
    if (!response.ok) throw new Error('Erro ao salvar resposta do quiz');
    return response.json();
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`${API_BASE_URL}/progress/leaderboard`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar leaderboard');
    return response.json();
  },
};

// Gamification API
export const gamificationAPI = {
  getProfile: async (): Promise<GamificationProfile> => {
    const response = await fetch(`${API_BASE_URL}/gamification/profile`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar perfil de gamificação');
    return response.json();
  },

  updateProfile: async (data: Partial<GamificationProfile>): Promise<GamificationProfile> => {
    const response = await fetch(`${API_BASE_URL}/gamification/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao atualizar perfil de gamificação');
    return response.json();
  },
};

// Audit API
export const auditAPI = {
  getLogs: async (role?: string, limit?: number, offset?: number): Promise<{ logs: AuditLog[]; total: number; limit: number; offset: number }> => {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response = await fetch(`${API_BASE_URL}/audit?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar logs de auditoria');
    return response.json();
  },

  createLog: async (data: { userId: string; action: string; entity: string; entityId?: string; details?: any }): Promise<AuditLog> => {
    const response = await fetch(`${API_BASE_URL}/audit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao criar log de auditoria');
    return response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  sendEmail: async (data: { to: string; subject: string; body: string; variables?: Record<string, string> }) => {
    const response = await fetch(`${API_BASE_URL}/notifications/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao enviar email');
    return response.json();
  },

  // Enviar email de teste com template HTML profissional
  sendTestEmail: async (data: { to: string; type: 'welcome' | 'progress' | 'achievement'; name?: string; lesson?: string; achievement?: string }) => {
    const response = await fetch(`${API_BASE_URL}/notifications/test`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao enviar email de teste');
    return response.json();
  },

  checkConfig: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/config`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao verificar configuração');
    return response.json();
  },
};
