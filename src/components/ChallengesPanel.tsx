import React, { useState, useEffect } from 'react';
import { Challenge } from '../types/gamification';
import { 
  getActiveChallenges, 
  checkChallengeCompletion, 
  calculateChallengeProgress 
} from '../utils/gamificationLogic';
import { useProgressStore } from '../stores/useProgressStore';
import { sendChallengeComplete, sendChallengeProgress } from '../utils/notifications';

interface ChallengesPanelProps {
  userId?: string;
}

const ChallengesPanel: React.FC<ChallengesPanelProps> = () => {
  const { completedLessons, quizAnswers, getGamificationProfile } = useProgressStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

  const profile = getGamificationProfile() || {
    streak: 0,
    studyHistory: []
  };

  // Carregar desafios ativos
  useEffect(() => {
    const activeChallenges = getActiveChallenges();
    setChallenges(activeChallenges);
  }, []);

  // Verificar conclusão de desafios e enviar notificações
  useEffect(() => {
    const completed = new Set<string>();
    const previouslyCompleted = new Set(completedChallenges);
    
    challenges.forEach(challenge => {
      const isCompleted = checkChallengeCompletion(challenge, completedLessons, quizAnswers, profile.streak);
      
      if (isCompleted) {
        completed.add(challenge.id);
        
        // Enviar notificação se acabou de completar
        if (!previouslyCompleted.has(challenge.id)) {
          sendChallengeComplete(challenge.title, challenge.xpReward, challenge.type);
        }
      } else {
        // Enviar notificação de progresso se atingiu 50%
        const progress = calculateChallengeProgress(challenge, completedLessons, quizAnswers, profile.streak);
        if (progress >= 50 && progress < 100) {
          sendChallengeProgress(challenge.title, progress);
        }
      }
    });

    setCompletedChallenges(completed);
  }, [challenges, completedLessons, quizAnswers, profile.streak]);

  // Agrupar desafios por tipo
  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');
  const monthlyChallenges = challenges.filter(c => c.type === 'monthly');

  // Formatar data de expiração
  const formatExpiry = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Expira em breve';
  };

  // Renderizar card de desafio
  const renderChallengeCard = (challenge: Challenge) => {
    const isCompleted = completedChallenges.has(challenge.id);
    const progress = calculateChallengeProgress(challenge, completedLessons, quizAnswers, profile.streak);
    
    return (
      <div
        key={challenge.id}
        className={`p-3 rounded-lg border-2 transition-all ${
          isCompleted
            ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-500'
            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
        }`}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-lg mr-1">
                {challenge.type === 'daily' ? '📅' : challenge.type === 'weekly' ? '📆' : '🗓️'}
              </span>
              <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                {challenge.title}
              </h4>
              {isCompleted && (
                <span className="ml-1 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                  ✅
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
              {challenge.description}
            </p>
          </div>
          <div className="text-right ml-2">
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400">
              +{challenge.xpReward} XP
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatExpiry(challenge.endDate)}
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        {!isCompleted && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 mb-0.5">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  progress >= 100
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-orange-400 to-orange-600'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="challenges-panel bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-2 sm:p-3 rounded-xl shadow-lg">
      <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-purple-600 dark:text-purple-400">🎯 Desafios Ativos</h3>
      
      <div className="space-y-2 sm:space-y-3">
        {/* Desafios Diários */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <span className="mr-1">📅</span> Diários
          </h4>
          <div className="space-y-2">
            {dailyChallenges.length > 0 ? (
              dailyChallenges.map(renderChallengeCard)
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-2 text-xs">
                Nenhum desafio diário ativo
              </div>
            )}
          </div>
        </div>

        {/* Desafios Semanais */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <span className="mr-1">📆</span> Semanais
          </h4>
          <div className="space-y-2">
            {weeklyChallenges.length > 0 ? (
              weeklyChallenges.map(renderChallengeCard)
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-2 text-xs">
                Nenhum desafio semanal ativo
              </div>
            )}
          </div>
        </div>

        {/* Desafios Mensais */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <span className="mr-1">🗓️</span> Mensais
          </h4>
          <div className="space-y-2">
            {monthlyChallenges.length > 0 ? (
              monthlyChallenges.map(renderChallengeCard)
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-2 text-xs">
                Nenhum desafio mensal ativo
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Desafios Completados</div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {completedChallenges.size} / {challenges.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">XP Total</div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {challenges.reduce((sum, c) => sum + c.xpReward, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPanel;
