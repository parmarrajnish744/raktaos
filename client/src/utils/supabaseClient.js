import { createClient } from '@supabase/supabase-js';

// Environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const rawAppUrl = import.meta.env.VITE_APP_URL;

// Configurable application URL (defaults to current window origin)
export function getAppBaseUrl() {
  if (rawAppUrl && typeof rawAppUrl === 'string' && rawAppUrl.trim().length > 0) {
    return rawAppUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:5173';
}

/**
 * Constructs the canonical public card URL:
 * e.g. https://raktabusiness.com/c/AB72KQ
 */
export function getPublicCardUrl(slug) {
  const base = getAppBaseUrl();
  return `${base}/c/${encodeURIComponent(slug || '')}`;
}

export const isSupabaseConfigured = Boolean(
  rawSupabaseUrl &&
  rawSupabaseAnonKey &&
  rawSupabaseUrl.startsWith('https://') &&
  !rawSupabaseUrl.includes('placeholder') &&
  rawSupabaseAnonKey.startsWith('eyJ')
);

if (!isSupabaseConfigured) {
  console.error(
    'CRITICAL: Supabase production credentials missing or malformed. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in client/.env.'
  );
}

// Production Supabase Client instance (Strictly cloud-backed, zero localStorage fallback DB)
export const supabase = createClient(
  rawSupabaseUrl || 'https://xsflkmhoxriskrpqpqyj.supabase.co',
  rawSupabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'rakta_supabase_auth_session'
    }
  }
);
