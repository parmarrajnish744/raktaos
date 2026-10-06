import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from '../../context/ToastContext';
import { getPublicCardUrl } from '../../utils/supabaseClient';

export default function QRModal({
  isOpen,
  onClose,
  card,
  cardUrl: propCardUrl,
  cardName: propCardName,
  primaryColor: propPrimaryColor = '#0B2E59'
}) {
  const { showToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compute resolved card properties (supports passing either direct props or card object)
  const resolvedCardUrl = propCardUrl || (card ? (card.cardUrl || card.url || (card.slug || card.username ? getPublicCardUrl(card.slug || card.username) : '')) : '');
  const resolvedCardName = propCardName || card?.full_name || card?.business_name || card?.title || 'Digital Business Card';
  const resolvedPrimaryColor = propPrimaryColor || card?.primary_color || '#0B2E59';

  useEffect(() => {
    let isMounted = true;
    if (isOpen && resolvedCardUrl) {
      setLoading(true);
      QRCode.toDataURL(resolvedCardUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: {
          dark: resolvedPrimaryColor || '#0B2E59',
          light: '#FFFFFF'
        }
      })
        .then((url) => {
          if (isMounted) {
            setQrDataUrl(url);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Failed to generate QR code data URL:', err);
          if (isMounted) {
            setLoading(false);
          }
        });
    } else {
      setQrDataUrl('');
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, resolvedCardUrl, resolvedPrimaryColor]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${(resolvedCardName || 'card').replace(/[^a-zA-Z0-9_-]/g, '_')}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('success', 'QR Code PNG downloaded!');
  };

  const handleDownloadSVG = async () => {
    if (!resolvedCardUrl) return;
    try {
      const svg = await QRCode.toString(resolvedCardUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: resolvedPrimaryColor || '#0B2E59',
          light: '#FFFFFF'
        }
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(resolvedCardName || 'card').replace(/[^a-zA-Z0-9_-]/g, '_')}-qr.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', 'Vector SVG QR downloaded!');
    } catch (e) {
      console.error('SVG QR error:', e);
      showToast('error', 'Failed to generate SVG QR');
    }
  };

  const handleCopyLink = () => {
    if (!resolvedCardUrl) return;
    navigator.clipboard.writeText(resolvedCardUrl).then(() => {
      setCopied(true);
      showToast('success', 'Card link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '420px', width: '92%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <QrCode size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Scan QR Code</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1.5rem' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--primary)',
            boxShadow: 'var(--shadow-md)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            minWidth: '240px',
            minHeight: '240px'
          }}>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: '220px', height: '220px', display: 'block', borderRadius: '4px' }}
              />
            ) : (
              <div style={{ width: '220px', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <span className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }} />
                <span style={{ fontSize: '0.875rem' }}>{loading ? 'Generating QR Code...' : 'Preparing QR Code...'}</span>
              </div>
            )}
          </div>

          <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem', wordBreak: 'break-word', maxWidth: '320px' }}>
            {resolvedCardName}
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: '300px' }}>
            Scan this QR code with any smartphone camera to open and save this digital card.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '320px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
              <button
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                <Download size={14} />
                <span>PNG</span>
              </button>
              <button
                onClick={handleDownloadSVG}
                disabled={!resolvedCardUrl}
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
              >
                <Download size={14} />
                <span>Vector SVG</span>
              </button>
            </div>
            <button
              onClick={handleCopyLink}
              disabled={!resolvedCardUrl}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Card Link'}</span>
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', padding: '0.875rem 1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Instant scan &bull; No app installation required
          </span>
        </div>
      </div>
    </div>
  );
}
