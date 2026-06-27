import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { AppRouter } from './AppRouter';

function ThemeManager({ children }: { children: React.ReactNode }) {
  const { getDynamicStyles } = useAppContext();
  
  useEffect(() => {
    const styles = getDynamicStyles();
    Object.entries(styles).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value as string);
    });
  }, [getDynamicStyles]);

  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <ThemeManager>
        <AppRouter />
      </ThemeManager>
    </AppProvider>
  );
}
