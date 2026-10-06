import { createClient } from '@supabase/supabase-js';

// Environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const rawAppUrl = import.meta.env.VITE_APP_URL;

// Configurable application URL (defaults to current window origin)
export function getAppBaseUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const hostname = window.location.hostname;
    // If on apex raktabusiness.com or www, route auth redirects to the SaaS application subdomain
    if (hostname === 'raktabusiness.com' || hostname === 'www.raktabusiness.com') {
      return 'https://app.raktabusiness.com';
    }
    // If on app.raktabusiness.com or any other non-localhost domain
    if (hostname === 'app.raktabusiness.com' || (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
      return window.location.origin.replace(/\/+$/, '');
    }
  }
  if (rawAppUrl && typeof rawAppUrl === 'string' && rawAppUrl.trim().length > 0) {
    return rawAppUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
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

// Cross-domain cookie storage adapter for *.raktabusiness.com with localStorage fallback
export const crossDomainStorage = {
  getItem: (key) => {
    if (typeof document === 'undefined') return null;
    try {
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + key + '=([^;]+)'));
      if (match) return decodeURIComponent(match[2]);
    } catch (e) {}
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key, value) => {
    if (typeof document !== 'undefined') {
      try {
        const isProdDomain = window.location.hostname.endsWith('raktabusiness.com');
        const domainStr = isProdDomain ? '; domain=.raktabusiness.com' : '';
        const secureStr = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax${secureStr}${domainStr}`;
      } catch (e) {}
    }
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: (key) => {
    if (typeof document !== 'undefined') {
      try {
        const isProdDomain = window.location.hostname.endsWith('raktabusiness.com');
        const domainStr = isProdDomain ? '; domain=.raktabusiness.com' : '';
        document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax${domainStr}`;
      } catch (e) {}
    }
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};

// Production Supabase Client instance (Strictly cloud-backed, zero localStorage fallback DB)
export const supabase = createClient(
  rawSupabaseUrl || 'https://xsflkmhoxriskrpqpqyj.supabase.co',
  rawSupabaseAnonKey || '',
  {
    auth: {
      storage: crossDomainStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'rakta_supabase_auth_session'
    }
  }
);

