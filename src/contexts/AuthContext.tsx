import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { ExtendedProfile } from "@/types/profile";
import { useNavigate } from "react-router-dom";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  profile: ExtendedProfile | null;
  mustChangePassword: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

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
      
      const profileData: ExtendedProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        position: data.position || null,
        role: data.role,
        avatar_url: data.avatar_url,
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
        needs_password_change: data.needs_password_change,
      };
      
      // Verificar se a senha precisa ser alterada
      setMustChangePassword(!!data.needs_password_change);
      
      return profileData;
    } catch (error) {
      console.error("[AuthContext] Erro ao buscar perfil:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(profileData => {
              if (profileData) {
                setProfile(profileData);
              }
            });
          }, 0);
        } else {
          setProfile(null);
          setMustChangePassword(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setMustChangePassword(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        isLoading, 
        profile, 
        signOut, 
        refreshProfile,
        mustChangePassword 
      }}
    >
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
