const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('cardpulse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (body) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Cards
  getCards: () => apiRequest('/cards'),
  getCard: (id) => apiRequest(`/cards/${id}`),
  createCard: (body) => apiRequest('/cards', { method: 'POST', body: JSON.stringify(body) }),
  updateCard: (id, body) => apiRequest(`/cards/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCard: (id) => apiRequest(`/cards/${id}`, { method: 'DELETE' }),
  getCardQR: (id, params = '') => apiRequest(`/cards/${id}/qr${params ? `?${params}` : ''}`),
  getCardAnalytics: (id) => apiRequest(`/cards/${id}/analytics`),

  // Public
  getPublicCard: (username) => apiRequest(`/public/card/${username}`),
  recordView: (id) => apiRequest(`/public/cards/${id}/view`, { method: 'POST' }),
  recordScan: (id) => apiRequest(`/public/cards/${id}/scan`, { method: 'POST' }),
  recordClick: (id, eventType) => apiRequest(`/public/cards/${id}/click`, {
    method: 'POST',
    body: JSON.stringify({ eventType })
  }),

  // Admin
  getAdminOverview: () => apiRequest('/admin/overview'),
  getAdminUsers: () => apiRequest('/admin/users'),
  getAdminCards: () => apiRequest('/admin/cards'),
  setCardStatus: (id, status) => apiRequest(`/admin/cards/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  adminDeleteCard: (id) => apiRequest(`/admin/cards/${id}`, { method: 'DELETE' }),
};
