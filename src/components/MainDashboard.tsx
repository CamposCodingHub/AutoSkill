import React, { useState } from 'react';
import GamificationSystem from './GamificationSystem';
import AnalyticsDashboard from './AnalyticsDashboard';
import MentorshipSystem from './MentorshipSystem';
import VirtualLab from './VirtualLab';
import CommunityHub from './CommunityHub';
import PortfolioSystem from './PortfolioSystem';
import CertificationSystem from './CertificationSystem';
import DiagnosticAI from './DiagnosticAI';
import ServiceMarketplace from './ServiceMarketplace';
import Microlearning from './Microlearning';
import UserSettings from './UserSettings';
import RecommendationsPanel from './RecommendationsPanel';
import LiveEvents from './LiveEvents';
import OnboardingTour from './OnboardingTour';

interface MainDashboardProps {
  userId: string;
  userName: string;
}

type TabType = 'home' | 'lessons' | 'gamification' | 'analytics' | 'mentorship' | 'lab' | 'community' | 'portfolio' | 'certifications' | 'diagnostic' | 'marketplace' | 'microlearning' | 'settings' | 'recommendations' | 'events';

const MainDashboard: React.FC<MainDashboardProps> = ({ userId, userName }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);

  const tabs = [
    { id: 'home' as TabType, label: '🏠 Início', icon: '🏠' },
    { id: 'lessons' as TabType, label: '📚 Aulas', icon: '📚' },
    { id: 'microlearning' as TabType, label: '⚡ Microlearning', icon: '⚡' },
    { id: 'gamification' as TabType, label: '🎮 Gamificação', icon: '🎮' },
    { id: 'analytics' as TabType, label: '📊 Analytics', icon: '📊' },
    { id: 'recommendations' as TabType, label: '🎯 Recomendações', icon: '🎯' },
    { id: 'events' as TabType, label: '🎬 Eventos', icon: '🎬' },
    { id: 'mentorship' as TabType, label: '🤝 Mentoria', icon: '🤝' },
    { id: 'lab' as TabType, label: '🔬 Laboratório', icon: '🔬' },
    { id: 'diagnostic' as TabType, label: '🤖 IA Diagnóstico', icon: '🤖' },
    { id: 'community' as TabType, label: '👥 Comunidade', icon: '👥' },
    { id: 'marketplace' as TabType, label: '🏪 Marketplace', icon: '🏪' },
    { id: 'portfolio' as TabType, label: '📁 Portfólio', icon: '📁' },
    { id: 'certifications' as TabType, label: '🎓 Certificações', icon: '🎓' },
    { id: 'settings' as TabType, label: '⚙️ Configurações', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg mr-3">
              AS
            </div>
            {sidebarOpen && (
              <div className="animate-fadeIn">
                <div className="font-bold text-lg text-gray-800 dark:text-gray-200">AutoSkill</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Plataforma Automotiva</div>
              </div>
            )}
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-120px)]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center p-2.5 rounded-lg transition-all duration-200 group ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{tab.icon}</span>
              {sidebarOpen && (
                <span className="ml-3 text-sm font-medium">{tab.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-sm"
          >
            <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span className="ml-2 text-xs font-medium">Recolher</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm p-5 sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar conteúdo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 w-80 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              </div>

              {/* Notifications */}
              <button className="relative p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all shadow-sm">
                <span className="text-xl">🔔</span>
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User */}
              <div className="flex items-center space-x-3 p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {userName.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{userName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Aluno</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-2">
          {activeTab === 'home' && (
            <div className="space-y-2">
              {/* Welcome Banner - Ultra Compacto */}
              <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-lg p-4 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Bem-vindo, {userName}! 👋</h2>
                    <p className="text-xs opacity-90 max-w-lg">Continue sua jornada de aprendizado automotivo.</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('microlearning')}
                      className="px-3 py-1.5 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-all text-xs"
                    >
                      Continuar
                    </button>
                    <button
                      onClick={() => setActiveTab('recommendations')}
                      className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-all border border-white/30 text-xs"
                    >
                      Recomendações
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats - Grid Compacto */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center text-sm shadow-sm shadow-blue-500/20">
                      📚
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-medium">+2</span>
                  </div>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">29</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Módulos</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center text-sm shadow-sm shadow-orange-500/20">
                      ⚡
                    </div>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded-full font-medium">+5</span>
                  </div>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">8</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Micro-aulas</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded flex items-center justify-center text-sm shadow-sm shadow-purple-500/20">
                      🎮
                    </div>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full font-medium">🔥</span>
                  </div>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">5</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Desafios</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center text-sm shadow-sm shadow-green-500/20">
                      🎓
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">✓</span>
                  </div>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">5</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Certificações</div>
                </div>
              </div>

              {/* Quick Access - Grid de 4 colunas */}
              <div>
                <h3 className="text-sm font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
                  <span className="mr-2">🚀</span>
                  Acesso Rápido
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setActiveTab('microlearning')}
                    className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 group text-left border border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center text-lg mb-1 shadow-sm shadow-orange-500/20 group-hover:scale-110 transition-transform">
                      ⚡
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs">Microlearning</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('diagnostic')}
                    className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 group text-left border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center text-lg mb-1 shadow-sm shadow-blue-500/20 group-hover:scale-110 transition-transform">
                      🤖
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs">IA Diagnóstico</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('lab')}
                    className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 group text-left border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded flex items-center justify-center text-lg mb-1 shadow-sm shadow-purple-500/20 group-hover:scale-110 transition-transform">
                      🔬
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs">Laboratório</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 group text-left border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center text-lg mb-1 shadow-sm shadow-green-500/20 group-hover:scale-110 transition-transform">
                      🏪
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs">Marketplace</div>
                  </button>
                </div>
              </div>

              {/* Recent Activity e Upcoming Events - Grid de 2 colunas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <h3 className="text-sm font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
                    <span className="mr-2">📊</span>
                    Atividade Recente
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center p-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-700 rounded border border-yellow-200 dark:border-gray-600">
                      <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center text-xs mr-2 flex-shrink-0">
                        ⚡
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs truncate">Micro-aula</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 px-1 py-0.5 rounded flex-shrink-0 ml-1">2h</div>
                    </div>

                    <div className="flex items-center p-1.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded border border-purple-200 dark:border-gray-600">
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-600 rounded flex items-center justify-center text-xs mr-2 flex-shrink-0">
                        🎮
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs truncate">Desafio</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 px-1 py-0.5 rounded flex-shrink-0 ml-1">5h</div>
                    </div>

                    <div className="flex items-center p-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded border border-green-200 dark:border-gray-600">
                      <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center text-xs mr-2 flex-shrink-0">
                        🎓
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs truncate">Certificação</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 px-1 py-0.5 rounded flex-shrink-0 ml-1">1d</div>
                    </div>
                  </div>
                </div>

                {/* Próximos Eventos */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <h3 className="text-sm font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
                    <span className="mr-2">🎬</span>
                    Próximos Eventos
                  </h3>
                  <div className="space-y-2">
                    <div className="p-1.5 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-gray-700 dark:to-gray-700 rounded border border-pink-200 dark:border-gray-600">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs mb-0.5">Webinar: Diagnóstico</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Amanhã, 14:00</div>
                      <button className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full hover:bg-pink-600 transition-colors">
                        Registrar
                      </button>
                    </div>
                    <div className="p-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 rounded border border-blue-200 dark:border-gray-600">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs mb-0.5">Workshop: Troca de Óleo</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Em 2 dias, 10:00</div>
                      <button className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full hover:bg-blue-600 transition-colors">
                        Registrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ranking - Full Width */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <h3 className="text-sm font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
                  <span className="mr-2">🏆</span>
                  Ranking
                </h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex-1 flex items-center p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-700 rounded">
                    <span className="text-sm mr-2">🥇</span>
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">JS</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs">João Silva</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">2,500 XP</div>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center p-2 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-700 rounded">
                    <span className="text-sm mr-2">🥈</span>
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">MS</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs">Maria Santos</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">2,300 XP</div>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center p-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-700 rounded">
                    <span className="text-sm mr-2">🥉</span>
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">PC</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs">Pedro Costa</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">2,100 XP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">📚 Aulas</h2>
              <p className="text-gray-600 dark:text-gray-400">Navegue pelos 29 módulos do curso.</p>
              <div className="mt-3 p-6 text-center text-gray-500 dark:text-gray-400">
                Selecione um módulo para começar
              </div>
            </div>
          )}

          {activeTab === 'gamification' && <GamificationSystem userId={userId} />}
          {activeTab === 'analytics' && <AnalyticsDashboard userId={userId} />}
          {activeTab === 'mentorship' && <MentorshipSystem userId={userId} />}
          {activeTab === 'lab' && <VirtualLab userId={userId} />}
          {activeTab === 'community' && <CommunityHub userId={userId} userName={userName} />}
          {activeTab === 'portfolio' && <PortfolioSystem userId={userId} userName={userName} />}
          {activeTab === 'certifications' && <CertificationSystem userId={userId} completedModules={[1, 2, 3]} />}
          {activeTab === 'diagnostic' && <DiagnosticAI userId={userId} />}
          {activeTab === 'marketplace' && <ServiceMarketplace userId={userId} userName={userName} />}
          {activeTab === 'microlearning' && <Microlearning userId={userId} />}
          {activeTab === 'settings' && <UserSettings userId={userId} userName={userName} />}
          {activeTab === 'recommendations' && <RecommendationsPanel userId={userId} />}
          {activeTab === 'events' && <LiveEvents userId={userId} />}
        </main>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour userId={userId} onNavigate={setActiveTab} />
    </div>
  );
};

export default MainDashboard;
