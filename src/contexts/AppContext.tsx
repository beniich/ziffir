import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  role: string;
}

interface AppContextType {
  user: User | null;
}

const AppContext = createContext<AppContextType>({ user: null });

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // For now we mock the user based on the sandbox token
    setUser({
      id: 'dev-proprietor',
      name: 'Dev Admin',
      role: 'administrateur'
    });
  }, []);

  return (
    <AppContext.Provider value={{ user }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
