
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  position: string | null;
  role: string;
  avatar_url: string | null;
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  profile: ProfileData | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Função para buscar o perfil do usuário atual
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return null;
      }
      
      return data as ProfileData;
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }
  };

  // Função para atualizar o perfil no estado do contexto
  const refreshProfile = async () => {
    if (!user) return;
    
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Define a função que será chamada quando o estado de autenticação mudar
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Busca o perfil quando o usuário faz login
        if (session?.user) {
          // Usando setTimeout(0) para evitar problemas de deadlock com o Supabase
          setTimeout(() => {
            fetchProfile(session.user.id).then(profileData => {
              if (profileData) {
                setProfile(profileData);
              }
            });
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Verifica se já existe uma sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Busca o perfil se houver um usuário na sessão
      if (session?.user) {
        fetchProfile(session.user.id).then(profileData => {
          if (profileData) {
            setProfile(profileData);
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, profile, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
