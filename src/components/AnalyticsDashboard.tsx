import React, { useState, useEffect } from 'react';
import type { AnalyticsDashboard, UserEngagementMetrics, LearningPattern, RetentionMetrics } from '../types/gamification';
import {
  generateAnalyticsDashboard,
  calculateUserEngagement,
  analyzeLearningPattern,
  calculateRetentionMetrics,
  loadSessionsFromStorage
} from '../utils/analyticsLogic';

interface AnalyticsDashboardProps {
  userId?: string;
}

const AnalyticsDashboardComponent: React.FC<AnalyticsDashboardProps> = ({ userId = 'default-user' }) => {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [userEngagement, setUserEngagement] = useState<UserEngagementMetrics | null>(null);
  const [learningPattern, setLearningPattern] = useState<LearningPattern | null>(null);
  const [retentionMetrics, setRetentionMetrics] = useState<RetentionMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'learning' | 'retention'>('overview');

  useEffect(() => {
    loadSessionsFromStorage();
    
    // Carregar dados do dashboard
    const dashboardData = generateAnalyticsDashboard();
    setDashboard(dashboardData);

    // Carregar métricas do usuário
    const engagementData = calculateUserEngagement(userId);
    setUserEngagement(engagementData);

    const patternData = analyzeLearningPattern(userId);
    setLearningPattern(patternData);

    const retentionData = calculateRetentionMetrics(userId);
    setRetentionMetrics(retentionData);
  }, [userId]);

  // Formatar tempo em segundos para formato legível
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Formatar data
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (!dashboard) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Carregando analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">📊 Dashboard de Analytics</h2>

      {/* Tabs de Navegação */}
      <div className="flex space-x-2 mb-6">
        {(['overview', 'engagement', 'learning', 'retention'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab === 'overview' ? '📈 Visão Geral' : 
             tab === 'engagement' ? '🎯 Engajamento' :
             tab === 'learning' ? '📚 Aprendizado' : '🔄 Retenção'}
          </button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Cards de Visão Geral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
              <div className="text-sm text-gray-600 dark:text-gray-400">Usuários Totais</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{dashboard.overview.totalUsers}</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
              <div className="text-sm text-gray-600 dark:text-gray-400">Ativos Hoje</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{dashboard.overview.activeUsersToday}</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
              <div className="text-sm text-gray-600 dark:text-gray-400">Tempo Total de Estudo</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {formatTime(dashboard.overview.totalStudyTime)}
              </div>
            </div>
          </div>

          {/* Métricas Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
              <div className="text-sm text-gray-600 dark:text-gray-400">Ativos na Semana</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dashboard.overview.activeUsersWeek}</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
              <div className="text-sm text-gray-600 dark:text-gray-400">Ativos no Mês</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dashboard.overview.activeUsersMonth}</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
              <div className="text-sm text-gray-600 dark:text-gray-400">Duração Média da Sessão</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatTime(dashboard.overview.averageSessionDuration)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
              <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Retenção Média</div>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {Math.round(dashboard.retention.averageRetentionRate)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'engagement' && userEngagement && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-blue-600 dark:text-blue-400">🎯 Seu Engajamento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score de Engajamento</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {userEngagement.engagementScore}/100
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                    style={{ width: `${userEngagement.engagementScore}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tempo Total de Estudo</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatTime(userEngagement.totalStudyTime)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sessões Completadas</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userEngagement.sessionsCount}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Duração Média por Sessão</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatTime(userEngagement.averageSessionDuration)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hora Mais Ativa</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {userEngagement.mostActiveHour}:00
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conclusão</div>
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {Math.round(userEngagement.completionRate)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-blue-600 dark:text-blue-400">📊 Engajamento Global</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score Médio de Engajamento</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(dashboard.engagement.averageEngagementScore)}/100
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Usuários em Risco</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {dashboard.retention.atRiskUsers.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'learning' && learningPattern && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-blue-600 dark:text-blue-400">📚 Padrão de Aprendizado</h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Tipo de Padrão</div>
              <div className={`text-2xl font-bold ${
                learningPattern.patternType === 'consistent' ? 'text-green-600 dark:text-green-400' :
                learningPattern.patternType === 'burst' ? 'text-blue-600 dark:text-blue-400' :
                learningPattern.patternType === 'declining' ? 'text-red-600 dark:text-red-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {learningPattern.patternType === 'consistent' ? '✅ Consistente' :
                 learningPattern.patternType === 'burst' ? '⚡ Em Explosão' :
                 learningPattern.patternType === 'declining' ? '⚠️ Em Declínio' :
                 '🔄 Irregular'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio Diário</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatTime(learningPattern.averageDailyStudyTime)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Horários de Pico</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {learningPattern.peakStudyHours.length > 0 
                    ? learningPattern.peakStudyHours.map(h => `${h}:00`).join(', ')
                    : 'N/A'}
                </div>
              </div>
            </div>

            {learningPattern.weakAreas.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Áreas para Melhorar</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {learningPattern.weakAreas.map(area => (
                    <span key={area} className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm">
                      Módulo {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {learningPattern.strongAreas.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Áreas Fortes</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {learningPattern.strongAreas.map(area => (
                    <span key={area} className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                      Módulo {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {learningPattern.recommendedNextSteps.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Recomendações</div>
                <ul className="mt-2 space-y-2">
                  {learningPattern.recommendedNextSteps.map((step, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="mr-2">💡</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'retention' && retentionMetrics && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-blue-600 dark:text-blue-400">🔄 Métricas de Retenção</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Retenção</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(retentionMetrics.retentionRate)}%
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mt-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                    style={{ width: `${retentionMetrics.retentionRate}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Risco de Churn</div>
                <div className={`text-3xl font-bold ${
                  retentionMetrics.churnRisk === 'low' ? 'text-green-600 dark:text-green-400' :
                  retentionMetrics.churnRisk === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {retentionMetrics.churnRisk === 'low' ? '✅ Baixo' :
                   retentionMetrics.churnRisk === 'medium' ? '⚠️ Médio' :
                   '🔴 Alto'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Dias Ativos</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {retentionMetrics.daysActive}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Primeira Sessão</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatDate(retentionMetrics.firstSessionDate)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Última Sessão</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatDate(retentionMetrics.lastSessionDate)}
                </div>
              </div>

              {retentionMetrics.predictedChurnDate && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Data Prevista de Churn</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatDate(retentionMetrics.predictedChurnDate)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Fatores de Retenção</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Consistência de Streak</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(retentionMetrics.factors.streakConsistency)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tendência de Engajamento</span>
                  <span className={`text-sm font-bold ${
                    retentionMetrics.factors.engagementTrend === 'increasing' ? 'text-green-600 dark:text-green-400' :
                    retentionMetrics.factors.engagementTrend === 'decreasing' ? 'text-red-600 dark:text-red-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {retentionMetrics.factors.engagementTrend === 'increasing' ? '📈 Crescente' :
                     retentionMetrics.factors.engagementTrend === 'decreasing' ? '📉 Decrescente' :
                     '➡️ Estável'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tendência de Conclusão</span>
                  <span className={`text-sm font-bold ${
                    retentionMetrics.factors.completionTrend === 'increasing' ? 'text-green-600 dark:text-green-400' :
                    retentionMetrics.factors.completionTrend === 'decreasing' ? 'text-red-600 dark:text-red-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {retentionMetrics.factors.completionTrend === 'increasing' ? '📈 Crescente' :
                     retentionMetrics.factors.completionTrend === 'decreasing' ? '📉 Decrescente' :
                     '➡️ Estável'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-blue-600 dark:text-blue-400">📊 Retenção Global</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Retenção Média</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(dashboard.retention.averageRetentionRate)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Churn</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {Math.round(dashboard.retention.churnRate)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Usuários Retornando</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {dashboard.retention.returningUsers}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Usuários em Risco</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {dashboard.retention.atRiskUsers.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboardComponent;
