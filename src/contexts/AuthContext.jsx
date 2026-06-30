/**
 * AuthContext.jsx
 * Supabase Auth session provider.
 * Exposes: user, role, session, signIn, signInWithGoogle, signUp, signOut, loading
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession]   = useState(null);
  const [user, setUser]         = useState(null);
  const [role, setRole]         = useState(null);  // 'admin' | 'viewer' | null
  const [loading, setLoading]   = useState(true);

  // Fetch the user's role from user_roles table
  const fetchRole = useCallback(async (userId) => {
    if (!userId) { setRole(null); return; }
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    setRole(data?.role ?? 'viewer');
  }, []);

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchRole(session?.user?.id).finally(() => setLoading(false));
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchRole(session?.user?.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  /**
   * Sign in with Google OAuth.
   * Supabase handles the redirect flow — user is sent to Google and back.
   * redirectTo must match an allowed URL in Supabase Auth settings.
   */
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  const isAdmin = role === 'admin';

  const value = { session, user, role, isAdmin, loading, signIn, signInWithGoogle, signUp, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
