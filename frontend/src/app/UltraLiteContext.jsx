import React, { createContext, useContext, useState, useEffect } from 'react';

const UltraLiteContext = createContext(null);

export const UltraLiteProvider = ({ children }) => {
  const [ultraLite, setUltraLite] = useState(() => {
    return localStorage.getItem('rih_ultra_lite') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('rih_ultra_lite', ultraLite ? 'true' : 'false');
    if (ultraLite) {
      document.documentElement.classList.add('ultra-lite');
    } else {
      document.documentElement.classList.remove('ultra-lite');
    }
  }, [ultraLite]);

  const toggleUltraLite = () => setUltraLite((prev) => !prev);

  return (
    <UltraLiteContext.Provider value={{ ultraLite, toggleUltraLite }}>
      {children}
    </UltraLiteContext.Provider>
  );
};

export const useUltraLite = () => {
  const context = useContext(UltraLiteContext);
  if (!context) throw new Error('useUltraLite must be used within an UltraLiteProvider');
  return context;
};
