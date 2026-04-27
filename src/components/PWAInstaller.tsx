import React, { useState, useEffect } from 'react';
import { OfflineManager, setupOnlineStatusListener, requestPushNotificationPermission, formatBytes } from '../utils/pwaLogic';

const PWAInstaller: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistered, setSwRegistered] = useState(false);
  const [offlineContent, setOfflineContent] = useState<any[]>([]);
  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    // Service Worker desabilitado temporariamente para evitar cache
    // OfflineManager.registerServiceWorker().then(registered => {
    //   setSwRegistered(registered);
    // });

    // Setup listener de status online/offline
    setupOnlineStatusListener(setIsOnline);

    // Carregar conteúdo offline
    setOfflineContent(OfflineManager.getOfflineContent());

    // Verificar permissão de notificações
    setPushEnabled(Notification.permission === 'granted');

    // Listener para mudanças no conteúdo offline
    const handleStorageChange = () => {
      setOfflineContent(OfflineManager.getOfflineContent());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleEnablePush = async () => {
    const granted = await requestPushNotificationPermission();
    setPushEnabled(granted);
  };

  const handleDownloadContent = async (moduleId: number, lessonId: string) => {
    const success = await OfflineManager.downloadContent(moduleId, lessonId);
    if (success) {
      setOfflineContent(OfflineManager.getOfflineContent());
    }
  };

  const handleRemoveContent = (moduleId: number, lessonId: string) => {
    OfflineManager.removeOfflineContent(moduleId, lessonId);
    setOfflineContent(OfflineManager.getOfflineContent());
  };

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja remover todo o conteúdo offline?')) {
      OfflineManager.clearOfflineContent();
      setOfflineContent(OfflineManager.getOfflineContent());
    }
  };

  if (!showOfflineManager) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-3">
          {!isOnline && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <span className="text-xl mr-2">📴</span>
              <span className="text-sm font-medium">Modo Offline</span>
            </div>
          )}
          {isOnline && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <span className="text-xl mr-2">📶</span>
              <span className="text-sm font-medium">Online</span>
            </div>
          )}
          <button
            onClick={() => setShowOfflineManager(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
          >
            Gerenciar Offline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Gerenciador Offline</h3>
          <button
            onClick={() => setShowOfflineManager(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {/* Status */}
        <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
            <span className={`text-sm font-medium ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Service Worker</span>
            <span className={`text-sm font-medium ${swRegistered ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {swRegistered ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Notificações</span>
            <button
              onClick={handleEnablePush}
              className={`text-sm font-medium ${pushEnabled ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}
            >
              {pushEnabled ? '✓ Ativadas' : 'Ativar'}
            </button>
          </div>
        </div>

        {/* Conteúdo Offline */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">Conteúdo Offline</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatBytes(OfflineManager.getTotalOfflineSize())}
            </span>
          </div>

          {offlineContent.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
              Nenhum conteúdo baixado
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {offlineContent.map((content, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div>
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                      Módulo {content.moduleId} - Aula {content.lessonId}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(content.size)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveContent(content.moduleId, content.lessonId)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <button
            onClick={() => {
              const moduleId = 1;
              const lessonId = '1';
              handleDownloadContent(moduleId, lessonId);
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm"
          >
            Baixar Aula Atual
          </button>
          {offlineContent.length > 0 && (
            <button
              onClick={handleClearAll}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm"
            >
              Limpar Tudo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller;
