import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

interface GamificationData {
  userId: string;
  userName: string;
  totalXP: number;
  currentLevel: number;
  streak: number;
  achievements: number;
}

interface PortfolioData {
  userId: string;
  userName: string;
  totalPortfolios: number;
  publishedPortfolios: number;
}

interface MentorshipData {
  userId: string;
  userName: string;
  asMentor: number;
  asMentee: number;
}

interface CertificationData {
  userId: string;
  userName: string;
  totalCertifications: number;
  completedCertifications: number;
}

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalProgress: number;
    avgProgressPerUser: number;
  };
  users: User[];
  growthByMonth: Record<string, number>;
  gamificationByUser: GamificationData[];
  portfoliosByUser: PortfolioData[];
  mentorshipsByUser: MentorshipData[];
  certificationsByUser: CertificationData[];
  levelDistribution: Record<number, number>;
}

interface UserAnalytics {
  user: User;
  progress: {
    completedLessons: number;
    quizStats: {
      totalAnswered: number;
      totalCorrect: number;
      totalQuestions: number;
    };
    quizAccuracy: number;
  };
  gamification: {
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
  };
  studyTimeline: Array<{ date: Date; type: string }>;
  portfolios: {
    total: number;
    published: number;
    draft: number;
    byDifficulty: Record<string, number>;
  };
  mentorships: {
    asMentor: number;
    asMentee: number;
    activeAsMentor: number;
    activeAsMentee: number;
  };
  certifications: {
    total: number;
    completed: number;
    inProgress: number;
    eligible: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdvancedAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'gamification' | 'portfolios' | 'mentorships' | 'certifications'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsAPI.getAdvancedAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAnalytics = async (userId: string) => {
    try {
      setLoadingUser(true);
      const data = await analyticsAPI.getUserAnalytics(userId);
      setSelectedUser(data);
    } catch (error) {
      console.error('Erro ao carregar analytics do usuário:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const filteredUsers = analyticsData?.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  }) || [];

  // Preparar dados para gráficos
  const growthChartData = Object.entries(analyticsData?.growthByMonth || {}).map(([month, count]) => ({
    month,
    users: count,
  }));

  const levelChartData = Object.entries(analyticsData?.levelDistribution || {}).map(([level, count]) => ({
    level: `Nível ${level}`,
    users: count,
  }));

  const topXPUsers = [...(analyticsData?.gamificationByUser || [])]
    .sort((a, b) => b.totalXP - a.totalXP)
    .slice(0, 10);

  const radarData = selectedUser ? [
    { subject: 'Progresso', value: selectedUser.progress.completedLessons * 10, fullMark: 100 },
    { subject: 'XP', value: Math.min(selectedUser.gamification.totalXP / 100, 100), fullMark: 100 },
    { subject: 'Streak', value: Math.min(selectedUser.gamification.streak * 10, 100), fullMark: 100 },
    { subject: 'Portfólios', value: Math.min(selectedUser.portfolios.total * 20, 100), fullMark: 100 },
    { subject: 'Mentorias', value: Math.min((selectedUser.mentorships.asMentor + selectedUser.mentorships.asMentee) * 15, 100), fullMark: 100 },
    { subject: 'Certificações', value: Math.min(selectedUser.certifications.total * 25, 100), fullMark: 100 },
  ] : [];

  const studyTimelineData = selectedUser?.studyTimeline.slice(-30).map(item => ({
    date: new Date(item.date).toLocaleDateString('pt-BR'),
    type: item.type,
  })) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="mb-4 text-orange-500 hover:text-orange-600 font-medium"
          >
            ← Voltar ao Painel Admin
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">📊 Analytics Avançado</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Análise detalhada de usuários e desempenho</p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(['overview', 'users', 'gamification', 'portfolios', 'mentorships', 'certifications'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-3xl font-bold text-orange-500">{analyticsData?.overview.totalUsers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total de Usuários</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-3xl font-bold text-green-500">{analyticsData?.overview.activeUsers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Usuários Ativos</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-3xl font-bold text-blue-500">{analyticsData?.overview.totalProgress}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total de Progressos</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-3xl font-bold text-purple-500">{analyticsData?.overview.avgProgressPerUser.toFixed(1)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Média por Usuário</div>
              </div>
            </div>

            {/* Growth Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📈 Crescimento de Usuários</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Level Distribution */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🎯 Distribuição de Níveis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={levelChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
              <div className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'user')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="all">Todos os papéis</option>
                  <option value="admin">Administradores</option>
                  <option value="user">Usuários</option>
                </select>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Papel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data de Cadastro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'Usuário'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => loadUserAnalytics(user.id)}
                            className="text-orange-500 hover:text-orange-600 font-medium"
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Gamification Tab */}
        {activeTab === 'gamification' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🏆 Top 10 Usuários por XP</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topXPUsers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="userName" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="totalXP" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📊 Distribuição de Níveis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={levelChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.level}: ${entry.users}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="users"
                  >
                    {levelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Portfolios Tab */}
        {activeTab === 'portfolios' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📁 Portfólios por Usuário</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData?.portfoliosByUser.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="userName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPortfolios" fill="#0088FE" name="Total" />
                  <Bar dataKey="publishedPortfolios" fill="#00C49F" name="Publicados" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Mentorships Tab */}
        {activeTab === 'mentorships' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🤝 Mentorias por Usuário</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData?.mentorshipsByUser.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="userName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="asMentor" fill="#FF8042" name="Como Mentor" />
                  <Bar dataKey="asMentee" fill="#8884D8" name="Como Mentorado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🎓 Certificações por Usuário</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData?.certificationsByUser.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="userName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCertifications" fill="#82CA9D" name="Total" />
                  <Bar dataKey="completedCertifications" fill="#00C49F" name="Completadas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Detalhes do Usuário: {selectedUser.user.name}
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                {loadingUser ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* User Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2">Informações do Usuário</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Email:</span>
                          <span className="ml-2 text-gray-800 dark:text-white">{selectedUser.user.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Papel:</span>
                          <span className="ml-2 text-gray-800 dark:text-white">{selectedUser.user.role}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Telefone:</span>
                          <span className="ml-2 text-gray-800 dark:text-white">{selectedUser.user.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Cadastro:</span>
                          <span className="ml-2 text-gray-800 dark:text-white">
                            {new Date(selectedUser.user.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2">📚 Progresso</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">{selectedUser.progress.completedLessons}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Lições Completadas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">{selectedUser.progress.quizAccuracy}%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Precisão nos Quizzes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-500">{selectedUser.progress.quizStats.totalAnswered}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Questões Respondidas</div>
                        </div>
                      </div>
                    </div>

                    {/* Gamification Stats */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2">🎮 Gamificação</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-500">{selectedUser.gamification.totalXP}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">XP Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-500">{selectedUser.gamification.currentLevel}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Nível Atual</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">{selectedUser.gamification.streak}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Streak Atual</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">{selectedUser.gamification.achievements.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Conquistas</div>
                        </div>
                      </div>
                    </div>

                    {/* Radar Chart */}
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-4">📊 Visão Geral do Desempenho</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis />
                          <Radar name="Desempenho" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Study Timeline */}
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-4">📅 Timeline de Estudo</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={studyTimelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="type" stroke="#8884d8" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Portfolios */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2">📁 Portfólios</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">{selectedUser.portfolios.total}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">{selectedUser.portfolios.published}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Publicados</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-500">{selectedUser.portfolios.draft}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Rascunhos</div>
                        </div>
                      </div>
                    </div>

                    {/* Mentorships */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2">🤝 Mentorias</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-500">{selectedUser.mentorships.asMentor}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Como Mentor</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-500">{selectedUser.mentorships.asMentee}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Como Mentorado</div>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2">🎓 Certificações</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">{selectedUser.certifications.completed}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Completadas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">{selectedUser.certifications.inProgress}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Em Progresso</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsPage;
