import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  QrCode,
  Eye,
  Download,
  Plus,
  Share2,
  ExternalLink,
  Edit,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserCards, getOwnerLeads } from '../services/cardService';
import QRModal from '../components/card-ui/QRModal';
import ShareModal from '../components/card-ui/ShareModal';
import { getPublicCardUrl } from '../utils/supabaseClient';

export default function DashboardOverview({ onNavigate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cards, setCards] = useState([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [activeQRCard, setActiveQRCard] = useState(null);
  const [activeShareCard, setActiveShareCard] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const [loadedCards, loadedLeads] = await Promise.all([
          getUserCards(user.id),
          getOwnerLeads(user.id)
        ]);
        setCards(loadedCards || []);
        setLeadsCount(loadedLeads ? loadedLeads.length : 0);
      } catch (err) {
        showToast('error', 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user?.id, showToast]);

  const totalCards = cards.length;
  // Resolve mismatch: card is active if is_active !== false AND status !== 'inactive'
  const activeCards = cards.filter((c) => c.is_active !== false && c.status !== 'inactive').length;
  const totalViews = cards.reduce((acc, c) => acc + (c.views_count || 0), 0);
  const totalScans = cards.reduce((acc, c) => acc + (c.scans_count || 0), 0);
  const totalDownloads = cards.reduce((acc, c) => acc + (c.downloads_count || 0), 0);

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 2.25rem',
        color: '#FFFFFF',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--secondary-light)',
            display: 'block',
            marginBottom: '0.25rem'
          }}>
            Rakta Business OS &bull; Phase 1 Production
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
            Welcome back, {user?.name || 'Partner'}!
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.925rem', marginTop: '0.35rem', margin: 0 }}>
            Here is your live real-time digital business identity, contact engagement, and inbound lead metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => onNavigate('/dashboard/cards/create')}
            className="btn btn-secondary btn-lg"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
            id="btn-create-card-banner"
          >
            <Plus size={18} />
            <span>Create New Card</span>
          </button>
        </div>
      </div>

      {/* Primary Analytics Metric Cards Grid */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div className="metric-val">{totalCards}</div>
            <div className="metric-label">Total Cards</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-dark)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="metric-val">{activeCards}</div>
            <div className="metric-label">Active Cards</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
            <Eye size={24} />
          </div>
          <div>
            <div className="metric-val">{totalViews}</div>
            <div className="metric-label">Profile Views</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <QrCode size={24} />
          </div>
          <div>
            <div className="metric-val">{totalScans}</div>
            <div className="metric-label">QR Scans</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: '#F3E8FF', color: '#7E22CE' }}>
            <Inbox size={24} />
          </div>
          <div>
            <div className="metric-val">{leadsCount}</div>
            <div className="metric-label">Inbound Leads</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: '#E0E7FF', color: '#4F46E5' }}>
            <Download size={24} />
          </div>
          <div>
            <div className="metric-val">{totalDownloads}</div>
            <div className="metric-label">vCard Downloads</div>
          </div>
        </div>
      </div>

      {/* Recent Cards Section */}
      <div className="card-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>My Digital Cards</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Live public business cards associated with your account
            </p>
          </div>

          <button
            onClick={() => onNavigate('/dashboard/cards')}
            className="btn btn-outline btn-sm"
          >
            <span>View All Cards</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading cards...
          </div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-lg)' }}>
            <CreditCard size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Digital Cards Created Yet</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Create your first card to get your personal public URL, high-resolution QR code, and click-to-contact buttons.
            </p>
            <button
              onClick={() => onNavigate('/dashboard/cards/create')}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Create First Business Card</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {cards.slice(0, 3).map((card) => {
              const isCardActive = card.is_active !== false && card.status !== 'inactive';
              const cardPublicUrl = card.public_url || (card.slug ? getPublicCardUrl(card.slug) : `/c/${card.slug || card.id}`);

              return (
                <div key={card.id} className="card-item-card" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                  <div className="card-item-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: card.primary_color || 'var(--primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      flexShrink: 0
                    }}>
                      {(card.company_name || 'C').charAt(0)}
                    </div>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {card.full_name}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {card.designation} &bull; {card.company_name}
                      </div>
                    </div>
                    <span className={`badge ${isCardActive ? 'badge-success' : 'badge-warning'}`}>
                      {isCardActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="card-item-body">
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Public URL:
                    </div>
                    <a
                      href={`/c/${card.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--secondary)',
                        wordBreak: 'break-all',
                        marginBottom: '1rem'
                      }}
                    >
                      <span>/c/{card.slug}</span>
                      <ExternalLink size={13} />
                    </a>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', backgroundColor: 'var(--surface-alt)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{card.views_count || 0}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Views</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{card.scans_count || 0}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scans</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{card.downloads_count || 0}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Downloads</div>
                      </div>
                    </div>
                  </div>

                  <div className="card-item-footer" style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                    <button
                      onClick={() => onNavigate(`/dashboard/cards/edit/${card.id}`)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1 }}
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setActiveQRCard(card)}
                      className="btn btn-ghost btn-sm btn-icon"
                      title="Show QR Code"
                    >
                      <QrCode size={16} />
                    </button>
                    <button
                      onClick={() => setActiveShareCard(card)}
                      className="btn btn-ghost btn-sm btn-icon"
                      title="Share Card"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {activeQRCard && (
        <QRModal
          card={activeQRCard}
          cardUrl={getPublicCardUrl(activeQRCard.slug || activeQRCard.username)}
          cardName={activeQRCard.full_name}
          primaryColor={activeQRCard.primary_color}
          isOpen={!!activeQRCard}
          onClose={() => setActiveQRCard(null)}
        />
      )}

      {activeShareCard && (
        <ShareModal
          card={activeShareCard}
          cardUrl={getPublicCardUrl(activeShareCard.slug || activeShareCard.username)}
          cardName={activeShareCard.full_name}
          isOpen={!!activeShareCard}
          onClose={() => setActiveShareCard(null)}
        />
      )}
    </div>
  );
}
