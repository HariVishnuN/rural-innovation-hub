import React, { createContext, useContext, useState, useEffect } from 'react';

const OfflineContext = createContext(null);

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [savedDraft, setSavedDraft] = useState(() => {
    try {
      const draft = localStorage.getItem('rih_invention_draft');
      return draft ? JSON.parse(draft) : null;
    } catch {
      return null;
    }
  });

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

  const saveDraft = (data) => {
    setSavedDraft(data);
    localStorage.setItem('rih_invention_draft', JSON.stringify(data));
  };

  const clearDraft = () => {
    setSavedDraft(null);
    localStorage.removeItem('rih_invention_draft');
  };

  return (
    <OfflineContext.Provider value={{ isOnline, savedDraft, saveDraft, clearDraft }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within an OfflineProvider');
  return context;
};
