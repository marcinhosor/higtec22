import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  companyId: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  companyId: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(async () => {
            const { data } = await supabase
              .from("profiles")
              .select("company_id")
              .eq("user_id", session.user.id)
              .maybeSingle();
            setCompanyId(data?.company_id ?? null);
            setLoading(false);
          }, 0);
        } else {
          setCompanyId(null);
          setLoading(false);
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setSession(null);
        setUser(null);
        setCompanyId(null);
        setLoading(false);
      }
      // If session exists, onAuthStateChange will handle it
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, companyId, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
