'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type LastUpdatedContextType = {
  lastUpdated: Date | null;
  updateLastUpdated: () => void;
};

const LastUpdatedContext = createContext<LastUpdatedContextType | undefined>(undefined);

export function LastUpdatedProvider({ children }: { children: ReactNode }) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updateLastUpdated = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  return (
    <LastUpdatedContext.Provider value={{ lastUpdated, updateLastUpdated }}>
      {children}
    </LastUpdatedContext.Provider>
  );
}

export function useLastUpdated() {
  const context = useContext(LastUpdatedContext);
  if (context === undefined) {
    throw new Error('useLastUpdated must be used within a LastUpdatedProvider');
  }
  return context;
}
