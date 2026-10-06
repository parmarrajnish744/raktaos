import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getPublicCardUrl } from '../../utils/supabaseClient';

export default function ShareModal({
  isOpen,
  onClose,
  card,
  cardUrl: propCardUrl,
  cardName: propCardName
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cardUrl = propCardUrl || (card ? (card.cardUrl || card.url || (card.slug || card.username ? getPublicCardUrl(card.slug || card.username) : '')) : '');
  const cardName = propCardName || card?.full_name || card?.business_name || card?.title || 'Digital Business Card';

  const encodedUrl = encodeURIComponent(cardUrl || '');
  const shareMessage = encodeURIComponent(`Here is the digital business card of ${cardName || 'our contact'}:\n${cardUrl || ''}`);

  const handleCopy = () => {
    if (!cardUrl) return;
    navigator.clipboard.writeText(cardUrl).then(() => {
      setCopied(true);
      showToast('success', 'Digital card link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareChannels = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      url: `https://wa.me/?text=${shareMessage}`
    },
    {
      name: 'Telegram',
      icon: Send,
      color: '#0088CC',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(`Contact card for ${cardName}`)}`
    },
    {
      name: 'LinkedIn',
      icon: Share2,
      color: '#0A66C2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      name: 'Email',
      icon: Share2,
      color: '#0B2E59',
      url: `mailto:?subject=${encodeURIComponent(`Digital Business Card - ${cardName}`)}&body=${shareMessage}`
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Share2 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Share Digital Card</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Share this digital business card with your clients and partners through any platform:
          </p>

          {/* Social Share Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {shareChannels.map((ch) => {
              const Icon = ch.icon;
              return (
                <a
                  key={ch.name}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-tile"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="action-tile-icon" style={{ backgroundColor: `${ch.color}20`, color: ch.color }}>
                    <Icon size={20} />
                  </div>
                  <span className="action-tile-label">{ch.name}</span>
                </a>
              );
            })}
          </div>

          {/* Direct URL Copy */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Direct Card URL</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                readOnly
                value={cardUrl}
                className="form-input"
                style={{ fontSize: '0.85rem', backgroundColor: 'var(--surface-alt)' }}
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
                style={{ flexShrink: 0 }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
