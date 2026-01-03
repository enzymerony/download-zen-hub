import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * SECURITY NOTE: Client-side isAdmin checks are for UI convenience only.
 * All actual data operations are protected by Row Level Security (RLS) policies
 * in the database. The frontend cannot be trusted for authorization decisions.
 * RLS policies using has_role() function are the true security boundary.
 */

// Cache duration for admin role check (15 minutes)
const ADMIN_CACHE_DURATION = 15 * 60 * 1000;

interface AdminCache {
  userId: string;
  isAdmin: boolean;
  timestamp: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  adminLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Persist admin cache in sessionStorage to survive tab switches
const getAdminCache = (): AdminCache | null => {
  try {
    const cached = sessionStorage.getItem('admin_role_cache');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore errors
  }
  return null;
};

const setAdminCache = (cache: AdminCache) => {
  try {
    sessionStorage.setItem('admin_role_cache', JSON.stringify(cache));
  } catch {
    // Ignore errors
  }
};

const clearAdminCache = () => {
  try {
    sessionStorage.removeItem('admin_role_cache');
  } catch {
    // Ignore errors
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const initialCheckDone = useRef(false);

  const checkAdminRole = async (userId: string, forceRefresh = false): Promise<boolean> => {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getAdminCache();
      if (cached && cached.userId === userId) {
        const isExpired = Date.now() - cached.timestamp > ADMIN_CACHE_DURATION;
        if (!isExpired) {
          return cached.isAdmin;
        }
      }
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking admin role:', error);
      }
      return false;
    }
    
    const result = !!data;
    
    // Cache the result
    setAdminCache({
      userId,
      isAdmin: result,
      timestamp: Date.now()
    });
    
    return result;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Only check admin role on actual auth events, not on every state change
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Check if we have a valid cache
            const cached = getAdminCache();
            const hasValidCache = cached && 
              cached.userId === session.user.id && 
              Date.now() - cached.timestamp < ADMIN_CACHE_DURATION;
            
            if (hasValidCache) {
              setIsAdmin(cached.isAdmin);
              setAdminLoading(false);
            } else {
              setAdminLoading(true);
              setTimeout(() => {
                checkAdminRole(session.user.id).then((result) => {
                  setIsAdmin(result);
                  setAdminLoading(false);
                });
              }, 0);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          setAdminLoading(false);
          clearAdminCache();
        }
      }
    );

    // THEN check for existing session (only once)
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          // Check if we have a valid cache
          const cached = getAdminCache();
          const hasValidCache = cached && 
            cached.userId === session.user.id && 
            Date.now() - cached.timestamp < ADMIN_CACHE_DURATION;
          
          if (hasValidCache) {
            setIsAdmin(cached.isAdmin);
            setAdminLoading(false);
          } else {
            setAdminLoading(true);
            checkAdminRole(session.user.id).then((result) => {
              setIsAdmin(result);
              setAdminLoading(false);
            });
          }
        } else {
          setAdminLoading(false);
        }
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, adminLoading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
