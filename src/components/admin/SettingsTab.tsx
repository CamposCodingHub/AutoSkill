import React, { useState, useEffect } from 'react';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUsers: number;
}

const defaultSettings: PlatformSettings = {
  siteName: 'AutoSkill',
  siteDescription: 'Plataforma de aprendizado em mecânica automotiva',
  logoUrl: '',
  primaryColor: '#f97316',
  secondaryColor: '#ea580c',
  accentColor: '#22c55e',
  maintenanceMode: false,
  allowRegistration: true,
  maxUsers: 1000,
};

const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('autoskill_platform_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('autoskill_platform_settings', JSON.stringify(settings));
      showMessage('success', 'Configurações salvas com sucesso!');
    } catch (error) {
      showMessage('error', 'Erro ao salvar configurações');
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar as configurações para os valores padrão?')) {
      setSettings(defaultSettings);
      localStorage.removeItem('autoskill_platform_settings');
      showMessage('success', 'Configurações resetadas com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">⚙️ Configurações da Plataforma</h3>
        
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
          {/* Branding */}
          <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">🎨 Identidade Visual</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Site
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição do Site
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL do Logo
                </label>
                <input
                  type="url"
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">🌈 Cores do Tema</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cor Primária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cor Secundária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cor de Destaque
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Preview:</strong>
              </p>
              <div className="mt-2 flex gap-2">
                <div 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Primária
                </div>
                <div 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: settings.secondaryColor }}
                >
                  Secundária
                </div>
                <div 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: settings.accentColor }}
                >
                  Destaque
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">⚙️ Configurações do Sistema</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Modo de Manutenção
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Impede novos acessos ao sistema</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Permitir Registro
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Permite novos usuários se cadastrarem</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Limite Máximo de Usuários
                </label>
                <input
                  type="number"
                  value={settings.maxUsers}
                  onChange={(e) => setSettings({ ...settings, maxUsers: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
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

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="text-md font-semibold text-blue-800 dark:text-blue-200 mb-2">ℹ️ Informações</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• As configurações são salvas no localStorage do navegador</li>
          <li>• Para aplicar as cores globalmente, é necessário recarregar a página</li>
          <li>• O modo de manutenção impede novos logins</li>
          <li>• O limite de usuários é apenas informativo</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsTab;
