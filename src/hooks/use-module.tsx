
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export type ModuleType = 'supermarket' | 'butcher';

export function useModule() {
  const [currentModule, setCurrentModule] = useState<ModuleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const storedModule = localStorage.getItem('userModule') as ModuleType | null;
    if (storedModule) {
      setCurrentModule(storedModule);
    }
    setIsLoading(false);
  }, [user]);

  const changeModule = (moduleType: ModuleType) => {
    localStorage.setItem('userModule', moduleType);
    setCurrentModule(moduleType);
    
    // Navigate to the appropriate dashboard
    if (moduleType === 'butcher') {
      navigate('/butcher/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const ensureModuleSelected = () => {
    if (!currentModule && !isLoading) {
      navigate('/select-module');
      return false;
    }
    return true;
  };

  return {
    currentModule,
    isLoading,
    changeModule,
    ensureModuleSelected
  };
}
