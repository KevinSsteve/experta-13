
import React, { createContext, useContext } from 'react';

type ThemeType = 'light';

type ThemeContextType = {
  theme: ThemeType;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // We now only use light theme
  const theme: ThemeType = 'light';

  // Apply light theme class to root element
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  const value = { theme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  
  return context;
};
