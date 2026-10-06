import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getAppBaseUrl } from '../utils/supabaseClient';

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
            emailConfirmedAt: authUser.email_confirmed_at || authUser.confirmed_at,
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
          emailConfirmedAt: u.email_confirmed_at || u.confirmed_at,
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
      emailConfirmedAt: authUser.email_confirmed_at || authUser.confirmed_at,
      ...authUser.user_metadata
    };
    setUser(normalizedUser);
    setSession(data.session);
    return { user: normalizedUser, session: data.session };
  };

  const register = async (name, email, password) => {
    const callbackUrl = `${getAppBaseUrl()}/auth/callback?type=signup`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'USER' },
        emailRedirectTo: callbackUrl
      }
    });
    if (error) throw new Error(error.message);

    const authUser = data.user;
    const normalizedUser = {
      id: authUser?.id,
      email: authUser?.email,
      name,
      role: 'USER',
      emailConfirmedAt: authUser?.email_confirmed_at || authUser?.confirmed_at
    };
    if (data.session) {
      setUser(normalizedUser);
      setSession(data.session);
    }
    return { user: normalizedUser, session: data.session };
  };

  const forgotPassword = async (email) => {
    const callbackUrl = `${getAppBaseUrl()}/auth/callback?type=recovery`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl
    });
    if (error) throw new Error(error.message);
    return data;
  };

  const resetPassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw new Error(error.message);
    return data;
  };

  const resendVerification = async (email) => {
    const callbackUrl = `${getAppBaseUrl()}/auth/callback?type=signup`;
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: callbackUrl
      }
    });
    if (error) throw new Error(error.message);
    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (userData) => {
    const { password, new_password, current_password, ...metadata } = userData;
    const targetNewPassword = new_password || password;

    // If changing password, verify current password first if provided
    if (targetNewPassword) {
      if (current_password && user?.email) {
        const { error: verifyErr } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: current_password
        });
        if (verifyErr) {
          throw new Error('Current password verification failed. Please enter your correct current password.');
        }
      }

      // Update actual Supabase Auth password
      const { error: passErr } = await supabase.auth.updateUser({
        password: targetNewPassword
      });
      if (passErr) throw new Error(passErr.message);
    }

    // Clean any accidental password keys from metadata before saving
    delete metadata.new_password;
    delete metadata.current_password;
    delete metadata.password;

    // Update metadata if any fields remain
    if (Object.keys(metadata).length > 0) {
      const { data, error: metaErr } = await supabase.auth.updateUser({
        data: metadata
      });
      if (metaErr) throw new Error(metaErr.message);
    }

    setUser(prev => ({ ...prev, ...metadata }));
    return { user: { ...user, ...metadata } };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isEmailVerified: Boolean(user?.emailConfirmedAt),
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        resendVerification,
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
