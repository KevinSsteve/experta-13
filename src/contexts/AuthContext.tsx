
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
      
      // Ensure all required fields exist in the profile data
      const profileData: ProfileData = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        position: data.position || null,
        role: data.role,
        avatar_url: data.avatar_url
      };
      
      return profileData;
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }
  };

  // Função para atualizar o perfil no estado do contexto
  const refreshProfile = async () => {
    if (!user) {
      console.warn("Tentativa de atualizar perfil sem usuário autenticado");
      
      // Verificar se há uma sessão ativa
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        setUser(sessionData.session.user);
        setSession(sessionData.session);
        const profileData = await fetchProfile(sessionData.session.user.id);
        if (profileData) {
          setProfile(profileData);
        }
        return;
      }
      
      return;
    }
    
    console.log("Atualizando perfil para usuário:", user.id);
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
    }
  };

  useEffect(() => {
    console.log("[AuthContext] Inicializando contexto de autenticação");
    
    // Define a função que será chamada quando o estado de autenticação mudar
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[AuthContext] Evento de autenticação:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Busca o perfil quando o usuário faz login
        if (session?.user) {
          console.log("[AuthContext] Usuário autenticado:", session.user.id);
          // Usando setTimeout(0) para evitar problemas de deadlock com o Supabase
          setTimeout(() => {
            fetchProfile(session.user.id).then(profileData => {
              if (profileData) {
                setProfile(profileData);
                console.log("[AuthContext] Perfil carregado com sucesso");
              } else {
                console.warn("[AuthContext] Não foi possível carregar o perfil");
              }
            });
          }, 0);
        } else {
          console.log("[AuthContext] Usuário desconectado ou não autenticado");
          setProfile(null);
        }
      }
    );

    // Verifica se já existe uma sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AuthContext] Verificando sessão existente:", session ? "Encontrada" : "Não encontrada");
      setSession(session);
      setUser(session?.user ?? null);
      
      // Busca o perfil se houver um usuário na sessão
      if (session?.user) {
        console.log("[AuthContext] Carregando perfil para sessão existente:", session.user.id);
        fetchProfile(session.user.id).then(profileData => {
          if (profileData) {
            setProfile(profileData);
            console.log("[AuthContext] Perfil carregado para sessão existente");
          } else {
            console.warn("[AuthContext] Não foi possível carregar o perfil para sessão existente");
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      console.log("[AuthContext] Limpando inscrição de eventos de autenticação");
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("[AuthContext] Iniciando logout");
    await supabase.auth.signOut();
    setProfile(null);
    console.log("[AuthContext] Logout concluído");
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
