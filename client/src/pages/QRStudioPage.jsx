import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  ExternalLink,
  Layers,
  Palette
} from 'lucide-react';
import QRCode from 'qrcode';
import { getUserCards } from '../services/cardService';
import { getPublicCardUrl } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PrintableStand from '../components/qr/PrintableStand';

export default function QRStudioPage({ onNavigate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [qrColor, setQrColor] = useState('#0B2E59');
  const [qrSize, setQrSize] = useState(400);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCards() {
      try {
        const loadedCards = await getUserCards(user?.id);
        setCards(loadedCards || []);
        if (loadedCards && loadedCards.length > 0) {
          setSelectedCardId(loadedCards[0].id);
          setQrColor(loadedCards[0].primary_color || '#0B2E59');
        }
      } catch (err) {
        showToast('error', 'Failed to load cards for QR Studio.');
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, [user?.id, showToast]);

  const activeCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const cardUrl = activeCard
    ? (activeCard.slug ? getPublicCardUrl(activeCard.slug) : getPublicCardUrl(activeCard.username || ''))
    : getPublicCardUrl('demo');

  useEffect(() => {
    if (cardUrl) {
      QRCode.toDataURL(cardUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: qrSize,
        color: {
          dark: qrColor || '#0B2E59',
          light: '#FFFFFF'
        }
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [cardUrl, qrColor, qrSize]);

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const cardIdent = activeCard?.slug || activeCard?.username || 'card';
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${cardIdent}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('success', 'High-res QR Code PNG downloaded!');
  };

  const handleDownloadSVG = async () => {
    try {
      const cardIdent = activeCard?.slug || activeCard?.username || 'card';
      const svg = await QRCode.toString(cardUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: qrColor || '#0B2E59',
          light: '#FFFFFF'
        }
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cardIdent}-qr.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', 'Vector SVG QR Code downloaded!');
    } catch (err) {
      showToast('error', 'Failed to generate SVG QR code');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardUrl).then(() => {
      setCopied(true);
      showToast('success', 'Public card link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
          QR Code & Printable Stand Studio
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Generate vector SVG, high-res PNG, or print counter display posters inspired by our reference standard.
        </p>
      </div>

      <div className="qr-studio-grid">
        {/* Controls Column */}
        <div className="card-panel">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary)' }}>
            Customization Options
          </h3>

          {/* Select Card */}
          <div className="form-group">
            <label className="form-label">Select Business Card</label>
            <select
              className="form-select"
              value={selectedCardId}
              onChange={(e) => {
                setSelectedCardId(e.target.value);
                const match = cards.find((c) => c.id === e.target.value);
                if (match?.primary_color) setQrColor(match.primary_color);
              }}
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} &bull; {c.company_name} (/c/{c.slug || c.username})
                </option>
              ))}
            </select>
          </div>

          {/* QR Color */}
          <div className="form-group">
            <label className="form-label">QR Code Dark Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="color"
                style={{
                  width: '44px',
                  height: '40px',
                  padding: '2px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
              />
              <input
                type="text"
                className="form-input"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
              />
            </div>
            <span className="form-helper">Match your corporate branding palette.</span>
          </div>

          {/* Resolution / Size */}
          <div className="form-group">
            <label className="form-label">Resolution Export Size ({qrSize}px)</label>
            <input
              type="range"
              min="200"
              max="1200"
              step="50"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>200px (Web)</span>
              <span>600px (Standard)</span>
              <span>1200px (Ultra Print)</span>
            </div>
          </div>

          {/* Target URL */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Scan Destination URL</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                readOnly
                className="form-input"
                style={{ backgroundColor: 'var(--surface-alt)' }}
                value={cardUrl}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-outline"
                style={{ flexShrink: 0 }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleDownloadPNG}
              className="btn btn-primary btn-block"
            >
              <Download size={16} />
              <span>Download High-Resolution PNG</span>
            </button>

            <button
              onClick={handleDownloadSVG}
              className="btn btn-outline btn-block"
            >
              <Download size={16} />
              <span>Download Vector SVG (Print Ready)</span>
            </button>

            <button
              onClick={() => setPrintOpen(true)}
              className="btn btn-secondary btn-block"
            >
              <Printer size={16} />
              <span>View & Print Reception Poster</span>
            </button>
          </div>
        </div>

        {/* QR Preview Column */}
        <div className="qr-preview-panel">
          <div className="qr-display-box">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Preview"
                style={{ width: '260px', height: '260px', display: 'block' }}
              />
            ) : (
              <div style={{ width: '260px', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Generating QR...
              </div>
            )}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
            {activeCard?.company_name || 'Your Company'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {activeCard?.full_name} &bull; {activeCard?.designation}
          </p>

          <span className="badge badge-success" style={{ padding: '0.35rem 0.85rem' }}>
            Level H Error Correction Enabled
          </span>
        </div>
      </div>

      {/* Printable Poster Stand Modal */}
      {printOpen && (
        <div className="modal-backdrop" onClick={() => setPrintOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px', padding: '1rem', backgroundColor: '#F8FAFC' }}
            onClick={(e) => e.stopPropagation()}
          >
            <PrintableStand
              card={{
                ...activeCard,
                public_url: cardUrl
              }}
              onClose={() => setPrintOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
