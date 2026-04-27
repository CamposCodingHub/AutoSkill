import { OfflineContent } from '../types/gamification';

// Gerenciar conteúdo offline
export const OfflineManager = {
  // Verificar se o navegador suporta service worker
  isServiceWorkerSupported: (): boolean => {
    return 'serviceWorker' in navigator;
  },

  // Registrar service worker
  registerServiceWorker: async (): Promise<boolean> => {
    if (!OfflineManager.isServiceWorkerSupported()) {
      console.log('Service Worker não suportado');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);
      return true;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return false;
    }
  },

  // Verificar status online/offline
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  // Baixar conteúdo para offline
  downloadContent: async (moduleId: number, lessonId: string): Promise<boolean> => {
    try {
      const offlineContent: OfflineContent = {
        moduleId,
        lessonId,
        downloaded: true,
        lastUpdated: new Date(),
        size: 0 // Seria calculado baseado no conteúdo real
      };

      const existingContent = OfflineManager.getOfflineContent();
      const updatedContent = existingContent.filter(
        c => !(c.moduleId === moduleId && c.lessonId === lessonId)
      );
      updatedContent.push(offlineContent);

      localStorage.setItem('autoskill_offline_content', JSON.stringify(updatedContent));
      return true;
    } catch (error) {
      console.error('Erro ao baixar conteúdo:', error);
      return false;
    }
  },

  // Obter conteúdo offline
  getOfflineContent: (): OfflineContent[] => {
    try {
      const stored = localStorage.getItem('autoskill_offline_content');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar conteúdo offline:', error);
      return [];
    }
  },

  // Verificar se conteúdo está disponível offline
  isContentAvailableOffline: (moduleId: number, lessonId: string): boolean => {
    const content = OfflineManager.getOfflineContent();
    return content.some(
      c => c.moduleId === moduleId && c.lessonId === lessonId && c.downloaded
    );
  },

  // Remover conteúdo offline
  removeOfflineContent: (moduleId: number, lessonId: string): boolean => {
    try {
      const content = OfflineManager.getOfflineContent();
      const updatedContent = content.filter(
        c => !(c.moduleId === moduleId && c.lessonId === lessonId)
      );
      localStorage.setItem('autoskill_offline_content', JSON.stringify(updatedContent));
      return true;
    } catch (error) {
      console.error('Erro ao remover conteúdo offline:', error);
      return false;
    }
  },

  // Calcular tamanho total do conteúdo offline
  getTotalOfflineSize: (): number => {
    const content = OfflineManager.getOfflineContent();
    return content.reduce((total, c) => total + c.size, 0);
  },

  // Limpar todo o conteúdo offline
  clearOfflineContent: (): boolean => {
    try {
      localStorage.removeItem('autoskill_offline_content');
      return true;
    } catch (error) {
      console.error('Erro ao limpar conteúdo offline:', error);
      return false;
    }
  }
};

// Listener para mudanças de status online/offline
export const setupOnlineStatusListener = (callback: (isOnline: boolean) => void): void => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
};

// Solicitar permissão para notificações push
export const requestPushNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
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

// Sincronizar dados quando online
export const syncDataWhenOnline = async (): Promise<void> => {
  if (!navigator.onLine) {
    console.log('Offline - dados serão sincronizados quando online');
    return;
  }

  try {
    // Sincronizar dados de gamificação
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: Date.now()
      })
    });

    if (response.ok) {
      console.log('Dados sincronizados com sucesso');
    }
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
};

// Formatar tamanho em bytes para formato legível
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
