import { useState, useEffect } from 'react';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingUpdates, setPendingUpdates] = useState([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addPendingUpdate = (update) => {
    setPendingUpdates(prev => [...prev, update]);
  };

  const clearPendingUpdates = () => {
    setPendingUpdates([]);
  };

  return { isOnline, pendingUpdates, addPendingUpdate, clearPendingUpdates };
};