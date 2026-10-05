import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  Eye,
  Download,
  Plus,
  Share2,
  ExternalLink,
  Edit3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { getUserCards } from '../services/cardService';
import { getPublicCardUrl } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import QRModal from '../components/card-ui/QRModal';
import ShareModal from '../components/card-ui/ShareModal';

export default function DashboardOverview({ onNavigate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeQRCard, setActiveQRCard] = useState(null);
  const [activeShareCard, setActiveShareCard] = useState(null);

  useEffect(() => {
    async function loadCards() {
      try {
        const loadedCards = await getUserCards(user?.id);
        setCards(loadedCards || []);
      } catch (err) {
        showToast('error', 'Failed to load business cards');
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, [user?.id, showToast]);

  const totalCards = cards.length;
  const activeCards = cards.filter((c) => c.status === 'active').length;
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
            Digital Business Card Dashboard
          </span>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Member'}!
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9375rem', maxWidth: '520px' }}>
            Manage your digital cards, analyze QR scans, and monitor contact downloads in real-time.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/dashboard/cards/create')}
          className="btn btn-secondary btn-lg"
          style={{ backgroundColor: '#2563EB', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' }}
        >
          <Plus size={18} />
          <span>Create New Card</span>
        </button>
      </div>

      {/* Metrics Overview Cards */}
      <div className="metrics-grid">
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
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <QrCode size={24} />
          </div>
          <div>
            <div className="metric-val">{totalScans}</div>
            <div className="metric-label">QR Scans</div>
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
              <span>Create Your First Card</span>
            </button>
          </div>
        ) : (
          <div className="cards-grid">
            {cards.slice(0, 4).map((card) => {
              const cardPublicUrl = `${window.location.origin}/card/${card.username}`;
              return (
                <div key={card.id} className="card-item-box">
                  <div className="card-item-header">
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
                    <span className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {card.status}
                    </span>
                  </div>

                  <div className="card-item-body">
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Public URL:
                    </div>
                    <a
                      href={card.slug ? `/c/${card.slug}` : `/card/${card.username}`}
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
                      <span>{card.slug ? `/c/${card.slug}` : `/card/${card.username}`}</span>
                      <ExternalLink size={13} />
                    </a>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', backgroundColor: 'var(--surface-alt)', padding: '0.625rem', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{card.views_count || 0}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Views</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--secondary)' }}>{card.scans_count || 0}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Scans</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success-dark)' }}>{card.downloads_count || 0}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>vCards</div>
                      </div>
                    </div>
                  </div>

                  <div className="card-item-actions">
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => onNavigate(`/dashboard/cards/${card.id}/edit`)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Card"
                      >
                        <Edit3 size={15} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setActiveQRCard(card)}
                        className="btn btn-ghost btn-sm"
                        title="View QR Code"
                      >
                        <QrCode size={15} />
                        <span>QR</span>
                      </button>
                      <button
                        onClick={() => setActiveShareCard(card)}
                        className="btn btn-ghost btn-sm"
                        title="Share Card"
                      >
                        <Share2 size={15} />
                      </button>
                    </div>

                    <a
                      href={card.slug ? `/c/${card.slug}` : `/card/${card.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <Eye size={14} />
                      <span>Preview</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {activeQRCard && (
        <QRModal
          isOpen={!!activeQRCard}
          onClose={() => setActiveQRCard(null)}
          cardUrl={getPublicCardUrl(activeQRCard.slug || activeQRCard.username)}
          cardName={activeQRCard.full_name}
          primaryColor={activeQRCard.primary_color}
        />
      )}

      {/* Share Modal */}
      {activeShareCard && (
        <ShareModal
          isOpen={!!activeShareCard}
          onClose={() => setActiveShareCard(null)}
          cardUrl={getPublicCardUrl(activeShareCard.slug || activeShareCard.username)}
          cardName={activeShareCard.full_name}
        />
      )}
    </div>
  );
}
