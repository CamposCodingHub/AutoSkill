import React, { useState, useEffect } from 'react';

interface GamificationConfig {
  xpPerLesson: number;
  xpPerQuizCorrect: number;
  xpPerQuizComplete: number;
  xpPerStreakDay: number;
  levelXPBase: number;
  levelXPMultiplier: number;
  leaderboardEnabled: boolean;
  leaderboardType: 'global' | 'module';
  streakBonusEnabled: boolean;
  achievementsEnabled: boolean;
}

const defaultConfig: GamificationConfig = {
  xpPerLesson: 50,
  xpPerQuizCorrect: 10,
  xpPerQuizComplete: 20,
  xpPerStreakDay: 15,
  levelXPBase: 100,
  levelXPMultiplier: 1.5,
  leaderboardEnabled: true,
  leaderboardType: 'global',
  streakBonusEnabled: true,
  achievementsEnabled: true,
};

const GamificationTab: React.FC = () => {
  const [config, setConfig] = useState<GamificationConfig>(defaultConfig);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedConfig = localStorage.getItem('autoskill_gamification_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('autoskill_gamification_config', JSON.stringify(config));
      showMessage('success', 'Configurações salvas com sucesso!');
    } catch (error) {
      showMessage('error', 'Erro ao salvar configurações');
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar as configurações para os valores padrão?')) {
      setConfig(defaultConfig);
      localStorage.removeItem('autoskill_gamification_config');
      showMessage('success', 'Configurações resetadas com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🎮 Configurações de Gamificação</h3>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* XP Settings */}
          <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">💎 Configurações de XP</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  XP por Aula
                </label>
                <input
                  type="number"
                  value={config.xpPerLesson}
                  onChange={(e) => setConfig({ ...config, xpPerLesson: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  XP por Resposta Correta no Quiz
                </label>
                <input
                  type="number"
                  value={config.xpPerQuizCorrect}
                  onChange={(e) => setConfig({ ...config, xpPerQuizCorrect: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  XP por Quiz Completo
                </label>
                <input
                  type="number"
                  value={config.xpPerQuizComplete}
                  onChange={(e) => setConfig({ ...config, xpPerQuizComplete: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  XP por Dia de Streak
                </label>
                <input
                  type="number"
                  value={config.xpPerStreakDay}
                  onChange={(e) => setConfig({ ...config, xpPerStreakDay: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Level Settings */}
          <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">📈 Configurações de Níveis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  XP Base para Nível 1
                </label>
                <input
                  type="number"
                  value={config.levelXPBase}
                  onChange={(e) => setConfig({ ...config, levelXPBase: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Multiplicador de XP por Nível
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.levelXPMultiplier}
                  onChange={(e) => setConfig({ ...config, levelXPMultiplier: parseFloat(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <strong>Fórmula de XP por Nível:</strong> XP = {config.levelXPBase} × {config.levelXPMultiplier}^(nível - 1)
              </p>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">⚙️ Ativar/Desativar Funcionalidades</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Leaderboard
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mostrar ranking de usuários</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.leaderboardEnabled}
                    onChange={(e) => setConfig({ ...config, leaderboardEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {config.leaderboardEnabled && (
                <div className="ml-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Leaderboard
                  </label>
                  <select
                    value={config.leaderboardType}
                    onChange={(e) => setConfig({ ...config, leaderboardType: e.target.value as 'global' | 'module' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="global">Global (todos os usuários)</option>
                    <option value="module">Por Módulo</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bônus de Streak
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recompensar dias consecutivos de estudo</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.streakBonusEnabled}
                    onChange={(e) => setConfig({ ...config, streakBonusEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Conquistas (Achievements)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Desbloquear badges e conquistas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.achievementsEnabled}
                    onChange={(e) => setConfig({ ...config, achievementsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              💾 Salvar Configurações
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              🔄 Resetar para Padrão
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">👁️ Preview das Configurações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{config.xpPerLesson} XP</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Por aula completada</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{config.xpPerQuizCorrect} XP</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Por resposta correta</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{config.xpPerQuizComplete} XP</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Por quiz completo</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{config.xpPerStreakDay} XP</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Por dia de streak</div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong>XP necessário para nível 2:</strong> {Math.round(config.levelXPBase * config.levelXPMultiplier)} XP
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong>XP necessário para nível 3:</strong> {Math.round(config.levelXPBase * Math.pow(config.levelXPMultiplier, 2))} XP
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong>XP necessário para nível 5:</strong> {Math.round(config.levelXPBase * Math.pow(config.levelXPMultiplier, 4))} XP
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationTab;
