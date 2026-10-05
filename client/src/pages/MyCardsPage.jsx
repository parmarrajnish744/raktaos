import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  QrCode,
  Share2,
  Edit3,
  Trash2,
  ExternalLink,
  BarChart3,
  Search,
  Check,
  Copy
} from 'lucide-react';
import { getUserCards, deleteCardInSupabase } from '../services/cardService';
import { getPublicCardUrl } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import QRModal from '../components/card-ui/QRModal';
import ShareModal from '../components/card-ui/ShareModal';

export default function MyCardsPage({ onNavigate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [activeQRCard, setActiveQRCard] = useState(null);
  const [activeShareCard, setActiveShareCard] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchCards = async () => {
    try {
      const data = await getUserCards(user?.id);
      setCards(data || []);
    } catch (err) {
      showToast('error', 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user?.id]);

  const handleDelete = async (id) => {
    try {
      await deleteCardInSupabase(id);
      showToast('success', 'Card deleted successfully.');
      setDeleteConfirmId(null);
      fetchCards();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete card.');
    }
  };

  const filteredCards = cards.filter((c) =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.company_name || c.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.username || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>My Business Cards</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage, edit, and share all your active digital business cards.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/dashboard/cards/create')}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Create New Card</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem', maxWidth: '400px', position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.5rem' }}
          placeholder="Search by name, company, or handle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Card Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading your business cards...
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <CreditCard size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Cards Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {search ? 'No business cards match your search term.' : 'You haven’t created any digital cards yet.'}
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
          {filteredCards.map((card) => {
            const publicPath = card.slug ? `/c/${card.slug}` : `/card/${card.username}`;
            const cardUrl = getPublicCardUrl(card.slug || card.username);
            return (
              <div key={card.id} className="card-item-box">
                <div className="card-item-header">
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: card.primary_color || 'var(--primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    {(card.company_name || card.company || 'C').charAt(0)}
                  </div>

                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {card.full_name}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {card.designation} &bull; {card.company_name || card.company}
                    </div>
                  </div>

                  <span className={`badge ${card.status === 'active' || card.is_active !== false ? 'badge-success' : 'badge-warning'}`}>
                    {card.status || (card.is_active !== false ? 'active' : 'inactive')}
                  </span>
                </div>

                <div className="card-item-body">
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Public Link:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <a
                      href={publicPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>{publicPath}</span>
                      <ExternalLink size={13} style={{ flexShrink: 0 }} />
                    </a>
                  </div>

                  {/* Metrics Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--surface-alt)',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
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
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Downloads</div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="card-item-actions">
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => onNavigate(`/dashboard/cards/${card.id}/edit`)}
                      className="btn btn-ghost btn-sm"
                      title="Edit card"
                    >
                      <Edit3 size={15} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setActiveQRCard(card)}
                      className="btn btn-ghost btn-sm"
                      title="QR Code"
                    >
                      <QrCode size={15} />
                    </button>

                    <button
                      onClick={() => setActiveShareCard(card)}
                      className="btn btn-ghost btn-sm"
                      title="Share link"
                    >
                      <Share2 size={15} />
                    </button>

                    <button
                      onClick={() => onNavigate(`/dashboard/analytics?cardId=${card.id}`)}
                      className="btn btn-ghost btn-sm"
                      title="Analytics"
                    >
                      <BarChart3 size={15} />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(card.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete card"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <a
                    href={publicPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    View
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)' }}>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Are you sure you want to permanently delete this digital business card? Any existing QR codes and public links will stop functioning.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn btn-danger btn-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

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
