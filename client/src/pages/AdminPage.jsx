import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Eye,
  QrCode,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../utils/api';
import { supabase } from '../utils/supabaseClient';
import { useToast } from '../context/ToastContext';

export default function AdminPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState('cards'); // 'cards' or 'users'
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [cardsList, setCardsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      // 1. Try Express API first if token present
      const [overRes, usersRes, cardsRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminCards()
      ]);
      setOverview(overRes.stats);
      setUsersList(usersRes.users || []);
      setCardsList(cardsRes.cards || []);
      setLoading(false);
      return;
    } catch (err) {
      // 2. Gracefully fall back to Supabase client
      try {
        const { data: cards } = await supabase.from('cards').select('*');
        const loadedCards = cards || [];
        setCardsList(loadedCards);

        const totalViews = loadedCards.reduce((a, b) => a + (b.views_count || 0), 0);
        const totalScans = loadedCards.reduce((a, b) => a + (b.scans_count || 0), 0);
        const totalDownloads = loadedCards.reduce((a, b) => a + (b.downloads_count || 0), 0);
        const activeCards = loadedCards.filter(c => c.is_active !== false && c.status !== 'inactive').length;

        // Extract unique user IDs or demo users
        const userIds = [...new Set(loadedCards.map(c => c.user_id).filter(Boolean))];
        const syntheticUsers = userIds.map(uid => ({
          id: uid,
          name: loadedCards.find(c => c.user_id === uid)?.full_name || 'Card Owner',
          email: loadedCards.find(c => c.user_id === uid)?.email || 'user@raktabusiness.com',
          role: 'USER',
          cards_count: loadedCards.filter(c => c.user_id === uid).length,
          created_at: loadedCards.find(c => c.user_id === uid)?.created_at
        }));

        setUsersList(syntheticUsers.length > 0 ? syntheticUsers : [
          { id: 'usr-1', name: 'Sudheer Borra', email: 'demo@raktabusiness.com', role: 'ADMIN', cards_count: loadedCards.length, created_at: new Date().toISOString() }
        ]);

        setOverview({
          totalUsers: syntheticUsers.length || 1,
          totalCards: loadedCards.length,
          activeCards,
          totalViews,
          totalScans,
          totalDownloads
        });
      } catch (supaErr) {
        showToast('error', 'Failed to load administrative telemetry.');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (cardId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.setCardStatus(cardId, nextStatus);
    } catch (err) {
      // Fallback: update in Supabase directly
      await supabase.from('cards').update({
        status: nextStatus,
        is_active: nextStatus === 'active',
        updated_at: new Date().toISOString()
      }).eq('id', cardId);
    }
    showToast('success', `Card status changed to ${nextStatus}.`);
    fetchAdminData();
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card as Administrator?')) return;
    try {
      await api.adminDeleteCard(cardId);
    } catch (err) {
      // Fallback: delete from Supabase directly
      await supabase.from('cards').delete().eq('id', cardId);
    }
    showToast('success', 'Card deleted by administrator.');
    fetchAdminData();
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <ShieldAlert size={28} color="var(--primary)" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
            System Administrator Control Panel
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Platform-wide user management, card status control, and aggregate platform telemetry.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading admin data...
        </div>
      ) : (
        <>
          {/* Overview Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="metric-val">{overview?.totalUsers || 0}</div>
                <div className="metric-label">Total Users</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <div className="metric-val">{overview?.totalCards || 0}</div>
                <div className="metric-label">Total Cards</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-dark)' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="metric-val">{overview?.activeCards || 0}</div>
                <div className="metric-label">Active Cards</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                <QrCode size={24} />
              </div>
              <div>
                <div className="metric-val">{overview?.totalScans || 0}</div>
                <div className="metric-label">Global Scans</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setTab('cards')}
              className={`btn ${tab === 'cards' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}
            >
              <span>Manage Cards ({cardsList.length})</span>
            </button>
            <button
              onClick={() => setTab('users')}
              className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}
            >
              <span>Manage Users ({usersList.length})</span>
            </button>
          </div>

          {/* Cards Tab */}
          {tab === 'cards' && (
            <div className="card-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Cardholder</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Company</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Owner Email</th>
                    <th style={{ padding: '0.75rem 1rem' }}>URL Handle</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Scans / Views</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cardsList.map((card) => (
                    <tr key={card.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>
                        {card.full_name}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                        {card.company_name}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                        {card.owner_email}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <a
                          href={`/c/${card.slug || card.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <span>/c/{card.slug || card.username}</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                          {card.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                        {card.scans_count || 0} / {card.views_count || 0}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleStatus(card.id, card.status)}
                          className={`btn ${card.status === 'active' ? 'btn-outline' : 'btn-success'} btn-sm`}
                          style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          {card.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                          title="Delete card"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="card-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Cards Created</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>
                        {u.name}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-neutral'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>
                        {u.card_count || 0}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
