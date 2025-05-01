
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { initializeMeatCuts } from '@/lib/butcher/api';

export type ModuleType = 'supermarket' | 'butcher';

export function useModule() {
  const [currentModule, setCurrentModule] = useState<ModuleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user's selected module from database or localStorage
  useEffect(() => {
    const fetchModulePreference = async () => {
      try {
        setIsLoading(true);
        
        // First try to get from localStorage for quick loading
        const storedModule = localStorage.getItem('userModule') as ModuleType | null;
        
        if (storedModule && (storedModule === 'supermarket' || storedModule === 'butcher')) {
          setCurrentModule(storedModule);
        }
        
        // If user is logged in, try to get from database
        if (user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('selected_module')
            .eq('id', user.id)
            .single();
            
          if (!error && data?.selected_module) {
            const dbModule = data.selected_module as ModuleType;
            // Update local storage and state if needed
            if (dbModule !== storedModule) {
              localStorage.setItem('userModule', dbModule);
              setCurrentModule(dbModule);
            }
          } else if (storedModule) {
            // If we have a module in localStorage but not in DB, update DB
            await supabase
              .from('profiles')
              .update({ selected_module: storedModule })
              .eq('id', user.id);
          }
        }
      } catch (error) {
        console.error("Error retrieving module preference:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModulePreference();
  }, [user]);

  // Change module function (updates both localStorage and DB if user is logged in)
  const changeModule = async (moduleType: ModuleType) => {
    try {
      // Update localStorage
      localStorage.setItem('userModule', moduleType);
      setCurrentModule(moduleType);
      
      // Update in database if user is logged in
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ selected_module: moduleType })
          .eq('id', user.id);
          
        // Se o módulo selecionado for o talho, inicializar dados de exemplo se necessário
        if (moduleType === 'butcher') {
          await initializeMeatCuts(user.id);
        }
      }
      
      // Navigate to the appropriate dashboard
      if (moduleType === 'butcher') {
        navigate('/butcher/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error changing module:", error);
    }
  };

  // Function to ensure a module is selected before accessing certain pages
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
