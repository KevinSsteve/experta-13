
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('experta-theme');
    
    if (storedTheme) {
      return storedTheme as Theme;
    }
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('experta-theme', newTheme);
      return newTheme;
    });
  };

  // Aplica a classe ao elemento root quando o tema muda
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Remove todas as classes de tema
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Adiciona a classe do tema atual
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Para compatibilidade com componentes que usam a classe dark
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const value = { theme, toggleTheme };

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
