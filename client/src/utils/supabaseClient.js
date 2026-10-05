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
  rawSupabaseUrl !== 'https://your-project.supabase.co' &&
  !rawSupabaseUrl.includes('placeholder') &&
  !rawSupabaseAnonKey.includes('PASTE') &&
  !rawSupabaseAnonKey.includes('placeholder') &&
  rawSupabaseAnonKey.startsWith('eyJ')
);

// Fallback local storage keys for offline/local development preview
const LOCAL_STORAGE_CARDS_KEY = 'rakta_supabase_cards_fallback';
const LOCAL_STORAGE_USER_KEY = 'rakta_supabase_user_fallback';
const LOCAL_STORAGE_LEADS_KEY = 'rakta_supabase_leads_fallback';
const LOCAL_STORAGE_EVENTS_KEY = 'rakta_supabase_events_fallback';
const LOCAL_STORAGE_BUSINESSES_KEY = 'rakta_supabase_businesses_fallback';

function getLocalItem(key, legacyKey) {
  try {
    const raw = localStorage.getItem(key) || (legacyKey ? localStorage.getItem(legacyKey) : null);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setLocalItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

function getLocalCards() {
  return getLocalItem(LOCAL_STORAGE_CARDS_KEY, 'cardpulse_supabase_cards_fallback') || [];
}

function saveLocalCards(cards) {
  setLocalItem(LOCAL_STORAGE_CARDS_KEY, cards);
}

function getLocalLeads() {
  return getLocalItem(LOCAL_STORAGE_LEADS_KEY) || [];
}

function saveLocalLeads(leads) {
  setLocalItem(LOCAL_STORAGE_LEADS_KEY, leads);
}

function getLocalEvents() {
  return getLocalItem(LOCAL_STORAGE_EVENTS_KEY) || [];
}

function saveLocalEvents(events) {
  setLocalItem(LOCAL_STORAGE_EVENTS_KEY, events);
}

function getLocalBusinesses() {
  return getLocalItem(LOCAL_STORAGE_BUSINESSES_KEY) || [];
}

function saveLocalBusinesses(b) {
  setLocalItem(LOCAL_STORAGE_BUSINESSES_KEY, b);
}

/**
 * Lightweight mock adapter used ONLY when Supabase credentials are not yet supplied,
 * ensuring zero crashes and full CRUD persistence during offline/local development.
 */
function createMockSupabaseClient() {
  return {
    auth: {
      async getSession() {
        const user = getLocalItem(LOCAL_STORAGE_USER_KEY, 'cardpulse_supabase_user_fallback') || {
          id: 'demo-user-001',
          email: 'demo@digitalcard.com',
          user_metadata: { name: 'Sudheer Borra', role: 'USER' }
        };
        return { data: { session: { user, access_token: 'mock-session-token' } }, error: null };
      },
      async getUser() {
        const user = getLocalItem(LOCAL_STORAGE_USER_KEY, 'cardpulse_supabase_user_fallback') || {
          id: 'demo-user-001',
          email: 'demo@digitalcard.com',
          user_metadata: { name: 'Sudheer Borra', role: 'USER' }
        };
        return { data: { user }, error: null };
      },
      async signUp({ email, password, options }) {
        const user = {
          id: 'user-' + Date.now().toString(36),
          email,
          user_metadata: options?.data || { name: email.split('@')[0], role: 'USER' }
        };
        setLocalItem(LOCAL_STORAGE_USER_KEY, user);
        return { data: { user, session: { user, access_token: 'mock-session-token' } }, error: null };
      },
      async signInWithPassword({ email }) {
        const isAdmin = email && email.toLowerCase().includes('admin');
        const user = {
          id: isAdmin ? 'admin-user-001' : 'demo-user-001',
          email: email || 'demo@raktabusiness.com',
          user_metadata: {
            name: isAdmin ? 'Rakta OS Admin' : 'Sudheer Borra',
            role: isAdmin ? 'ADMIN' : 'USER'
          }
        };
        setLocalItem(LOCAL_STORAGE_USER_KEY, user);
        return { data: { user, session: { user, access_token: 'mock-session-token' } }, error: null };
      },
      async signOut() {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        return { error: null };
      },
      async updateUser({ data }) {
        const current = getLocalItem(LOCAL_STORAGE_USER_KEY) || {};
        const updated = { ...current, user_metadata: { ...(current.user_metadata || {}), ...data } };
        setLocalItem(LOCAL_STORAGE_USER_KEY, updated);
        return { data: { user: updated }, error: null };
      },
      onAuthStateChange(callback) {
        return {
          data: {
            subscription: {
              unsubscribe() {}
            }
          }
        };
      }
    },
    from(table) {
      const getStore = () => {
        if (table === 'cards') return getLocalCards();
        if (table === 'leads') return getLocalLeads();
        if (table === 'analytics_events') return getLocalEvents();
        if (table === 'businesses') return getLocalBusinesses();
        return [];
      };

      const saveStore = (items) => {
        if (table === 'cards') saveLocalCards(items);
        if (table === 'leads') saveLocalLeads(items);
        if (table === 'analytics_events') saveLocalEvents(items);
        if (table === 'businesses') saveLocalBusinesses(items);
      };

      return {
        select(query = '*') {
          let list = getStore();
          const builder = {
            eq(field, value) {
              list = list.filter(item => String(item[field]).toLowerCase() === String(value).toLowerCase());
              return builder;
            },
            order(field, { ascending = false } = {}) {
              list = [...list].sort((a, b) => {
                const va = a[field] || '';
                const vb = b[field] || '';
                return ascending ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
              });
              return builder;
            },
            limit(count) {
              list = list.slice(0, count);
              return builder;
            },
            async single() {
              const item = list[0] || null;
              if (!item) return { data: null, error: { message: `${table} record not found`, code: 'PGRST116' } };
              return { data: item, error: null };
            },
            then(resolve) {
              return Promise.resolve({ data: list, error: null }).then(resolve);
            }
          };
          return builder;
        },
        async insert(payload) {
          const items = getStore();
          const toInsert = Array.isArray(payload) ? payload : [payload];
          const inserted = toInsert.map(c => ({
            id: c.id || (`${table}-` + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: c.is_active !== undefined ? c.is_active : true,
            views_count: 0,
            scans_count: 0,
            downloads_count: 0,
            ...c
          }));
          items.push(...inserted);
          saveStore(items);
          return { data: Array.isArray(payload) ? inserted : inserted[0], error: null };
        },
        update(updates) {
          return {
            eq(field, value) {
              return {
                async select() {
                  const items = getStore();
                  let matched = null;
                  const nextItems = items.map(c => {
                    if (String(c[field]) === String(value)) {
                      matched = { ...c, ...updates, updated_at: new Date().toISOString() };
                      return matched;
                    }
                    return c;
                  });
                  saveStore(nextItems);
                  return { data: matched ? [matched] : [], error: null };
                },
                then(resolve) {
                  const items = getStore();
                  let matched = null;
                  const nextItems = items.map(c => {
                    if (String(c[field]) === String(value)) {
                      matched = { ...c, ...updates, updated_at: new Date().toISOString() };
                      return matched;
                    }
                    return c;
                  });
                  saveStore(nextItems);
                  return Promise.resolve({ data: matched ? [matched] : [], error: null }).then(resolve);
                }
              };
            }
          };
        },
        delete() {
          return {
            eq(field, value) {
              return {
                then(resolve) {
                  const items = getStore();
                  const remaining = items.filter(c => String(c[field]) !== String(value));
                  saveStore(remaining);
                  return Promise.resolve({ data: null, error: null }).then(resolve);
                }
              };
            }
          };
        }
      };
    },
    async rpc(funcName, params) {
      if (funcName === 'increment_card_metric' || funcName === 'record_card_event') {
        const cardSlug = params?.card_slug || params?.p_card_slug;
        const metricType = params?.metric_type || params?.p_event_type;
        const cards = getLocalCards();
        const next = cards.map(c => {
          if (c.slug === cardSlug) {
            const copy = { ...c };
            if (metricType === 'view') copy.views_count = (copy.views_count || 0) + 1;
            if (metricType === 'scan') copy.scans_count = (copy.scans_count || 0) + 1;
            if (metricType === 'download' || metricType === 'vcard_download') copy.downloads_count = (copy.downloads_count || 0) + 1;
            return copy;
          }
          return c;
        });
        saveLocalCards(next);

        // Record in events store
        const events = getLocalEvents();
        events.push({
          id: 'event-' + Date.now(),
          card_slug: cardSlug,
          event_type: metricType,
          referrer: params?.p_referrer || null,
          device_type: params?.p_device_type || 'desktop',
          created_at: new Date().toISOString()
        });
        saveLocalEvents(events);

        return { data: { success: true }, error: null };
      }

      if (funcName === 'submit_card_lead') {
        const { p_card_slug, p_name, p_phone, p_email, p_message } = params || {};
        const cards = getLocalCards();
        const card = cards.find(c => c.slug === p_card_slug);
        const leads = getLocalLeads();
        const newLead = {
          id: 'lead-' + Date.now(),
          business_id: card?.business_id || null,
          card_id: card?.id || null,
          name: p_name,
          phone: p_phone,
          email: p_email,
          message: p_message,
          status: 'New',
          source: 'public_card',
          created_at: new Date().toISOString()
        };
        leads.push(newLead);
        saveLocalLeads(leads);
        return { data: { success: true, lead_id: newLead.id }, error: null };
      }

      return { data: null, error: null };
    }
  };
}

// Export singleton client
export const supabase = isSupabaseConfigured
  ? createClient(rawSupabaseUrl, rawSupabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createMockSupabaseClient();
