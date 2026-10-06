import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useToast } from '../context/ToastContext';

export default function AuthCallbackPage({ onNavigate }) {
  const { showToast } = useToast();
  const [statusMessage, setStatusMessage] = useState('Verifying your credentials with Rakta Business OS...');

  useEffect(() => {
    let mounted = true;

    async function handleAuthCallback() {
      try {
        const hash = window.location.hash.replace(/^#/, '');
        const search = window.location.search.replace(/^\?/, '');
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(search);

        const getParam = (key) => hashParams.get(key) || searchParams.get(key);

        const error = getParam('error') || getParam('error_code');
        const errorDescription = getParam('error_description');

        if (error) {
          throw new Error(errorDescription || `Authentication error: ${error}`);
        }

        const code = getParam('code');
        const accessToken = getParam('access_token');
        const refreshToken = getParam('refresh_token');
        const type = getParam('type');

        // 1. PKCE Code Exchange (Supabase Auth v2 default)
        if (code) {
          setStatusMessage('Exchanging authorization code for secure session...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        // 2. Implicit Hash Fragment Session (Supabase Auth v1 / magic links)
        if (accessToken && refreshToken) {
          setStatusMessage('Establishing authenticated session...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (sessionError) throw sessionError;
        }

        // 3. Immediately clean both hash and search to prevent token/code leakage in browser history
        if (window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        // 4. Confirm active session from Supabase Client
        const { data: { session } } = await supabase.auth.getSession();

        if (type === 'recovery') {
          if (mounted) {
            setStatusMessage('Password recovery authorized. Redirecting to reset form...');
            setTimeout(() => onNavigate('/reset-password'), 500);
          }
          return;
        }

        if (type === 'signup') {
          showToast('success', 'Email confirmed successfully! Welcome to Rakta Business OS.');
          if (mounted) {
            setStatusMessage('Email verified! Redirecting to card builder...');
            setTimeout(() => onNavigate('/dashboard/cards/create'), 600);
          }
          return;
        }

        // Standard SSO, magic link, or callback
        if (session) {
          showToast('success', 'Successfully authenticated!');
          if (mounted) {
            setStatusMessage('Authentication successful! Loading dashboard...');
            setTimeout(() => onNavigate('/dashboard'), 500);
          }
        } else {
          // If no session could be established
          if (mounted) {
            setStatusMessage('Redirecting to login...');
            setTimeout(() => onNavigate('/login'), 700);
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        showToast('error', err.message || 'Authentication handoff failed.');
        if (mounted) {
          setStatusMessage('Authentication failed. Returning to login...');
          setTimeout(() => onNavigate('/login'), 1500);
        }
      }
    }

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [onNavigate, showToast]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: 'var(--bg)'
    }}>
      <div className="card-panel" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontWeight: 800,
          fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(11, 46, 89, 0.25)'
        }}>
          R
        </div>

        <div style={{
          width: 32,
          height: 32,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--secondary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1.25rem'
        }} />

        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          Secure Authentication
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
          {statusMessage}
        </p>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
