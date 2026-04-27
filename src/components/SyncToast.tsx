import React from 'react';
import { useProgressStore } from '../stores/useProgressStore';

const SyncToast: React.FC = () => {
  const isSyncing = useProgressStore((state) => state.isSyncing);

  if (!isSyncing) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
      <span className="text-sm">💾 Salvando...</span>
    </div>
  );
};

export default SyncToast;
