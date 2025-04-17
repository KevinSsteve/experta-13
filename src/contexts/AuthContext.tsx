
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { ExtendedProfile } from "@/types/profile";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  profile: ExtendedProfile | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("[AuthContext] Erro ao buscar perfil:", error);
        return null;
      }
      
      // Map database fields to profile properties using only snake_case as defined in ExtendedProfile
      const profileData: ExtendedProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        position: data.position || null,
        role: data.role,
        avatar_url: data.avatar_url,
        needs_password_change: data.needs_password_change || null,
        tax_id: data.tax_id || null,
        currency: data.currency || null,
        tax_rate: data.tax_rate || null,
        receipt_message: data.receipt_message || null,
        receipt_logo: data.receipt_logo || null,
        receipt_title: data.receipt_title || null,
        receipt_show_logo: data.receipt_show_logo || null,
        receipt_show_signature: data.receipt_show_signature || null,
        receipt_footer_text: data.receipt_footer_text || null,
        receipt_additional_info: data.receipt_additional_info || null,
        company_neighborhood: data.company_neighborhood || null,
        company_city: data.company_city || null,
        company_social_media: data.company_social_media || null,
      };
      
      return profileData;
    } catch (error) {
      console.error("[AuthContext] Erro ao buscar perfil:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) {
      console.warn("[AuthContext] Tentativa de atualizar perfil sem usuário autenticado");
      
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
    
    console.log("[AuthContext] Atualizando perfil para usuário:", user.id);
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
    }
  };

  useEffect(() => {
    console.log("[AuthContext] Inicializando contexto de autenticação");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[AuthContext] Evento de autenticação:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (session?.user) {
          console.log("[AuthContext] Usuário autenticado:", session.user.id);
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AuthContext] Verificando sessão existente:", session ? "Encontrada" : "Não encontrada");
      setSession(session);
      setUser(session?.user ?? null);
      
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
