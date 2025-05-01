
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
      console.log("[AuthContext] Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("[AuthContext] Error fetching profile:", error);
        return null;
      }
      
      if (!data) {
        console.warn("[AuthContext] No profile found for user:", userId);
        return null;
      }
      
      console.log("[AuthContext] Profile data loaded:", data);
      
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
      
      // Verify if the password needs to be changed
      setMustChangePassword(!!data.needs_password_change);
      console.log("[AuthContext] Profile loaded successfully. Password change needed:", !!data.needs_password_change);
      
      return profileData;
    } catch (error) {
      console.error("[AuthContext] Error fetching profile:", error);
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
    console.log("[AuthContext] Setting up auth state change listener");
    
    // First, establish the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[AuthContext] Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (session?.user) {
          // Use setTimeout to avoid any potential deadlock with Supabase's internal auth state management
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

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AuthContext] Initial session check:", session ? `Logged in as ${session.user?.email}` : "Not logged in");
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("[AuthContext] Signing out");
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
