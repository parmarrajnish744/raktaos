import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state directly from Supabase session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted && currentSession) {
          setSession(currentSession);
          const authUser = currentSession.user;
          setUser({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            role: authUser.user_metadata?.role || 'USER',
            ...authUser.user_metadata
          });
        }
      } catch (err) {
        console.warn('Auth initialization notice:', err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen for Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        const u = newSession.user;
        setUser({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.name || u.email?.split('@')[0] || 'User',
          role: u.user_metadata?.role || 'USER',
          ...u.user_metadata
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const authUser = data.user;
    const normalizedUser = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      role: authUser.user_metadata?.role || 'USER',
      ...authUser.user_metadata
    };
    setUser(normalizedUser);
    setSession(data.session);
    return { user: normalizedUser, session: data.session };
  };

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'USER' }
      }
    });
    if (error) throw new Error(error.message);

    const authUser = data.user;
    const normalizedUser = {
      id: authUser.id,
      email: authUser.email,
      name,
      role: 'USER'
    };
    setUser(normalizedUser);
    setSession(data.session);
    return { user: normalizedUser, session: data.session };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (userData) => {
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });
    if (error) throw new Error(error.message);
    setUser(prev => ({ ...prev, ...userData }));
    return { user: { ...user, ...userData } };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
