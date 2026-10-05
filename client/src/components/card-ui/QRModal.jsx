import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from '../../context/ToastContext';

export default function QRModal({ isOpen, onClose, cardUrl, cardName, primaryColor = '#0B2E59' }) {
  const { showToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && cardUrl) {
      QRCode.toDataURL(cardUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: {
          dark: primaryColor || '#0B2E59',
          light: '#FFFFFF'
        }
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [isOpen, cardUrl, primaryColor]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${(cardName || 'card').replace(/[^a-zA-Z0-9_-]/g, '_')}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('success', 'QR Code PNG downloaded!');
  };

  const handleDownloadSVG = async () => {
    try {
      const svg = await QRCode.toString(cardUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: primaryColor || '#0B2E59',
          light: '#FFFFFF'
        }
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(cardName || 'card').replace(/[^a-zA-Z0-9_-]/g, '_')}-qr.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', 'Vector SVG QR downloaded!');
    } catch (e) {
      showToast('error', 'Failed to generate SVG QR');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardUrl).then(() => {
      setCopied(true);
      showToast('success', 'Card link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <QrCode size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Scan QR Code</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirectiom: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--primary)',
            boxShadow: 'var(--shadow-md)',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            ) : (
              <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Generating QR...
              </div>
            )}
          </div>

          <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
            {cardName || 'Digital Business Card'}
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: '300px' }}>
            Scan this QR code with any smartphone camera to open and save this digital card.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
              <button
                onClick={handleDownload}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                <Download size={14} />
                <span>PNG</span>
              </button>
              <button
                onClick={handleDownloadSVG}
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
              >
                <Download size={14} />
                <span>Vector SVG</span>
              </button>
            </div>
            <button
              onClick={handleCopyLink}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Card Link'}</span>
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Instant scan &bull; No app installation required
          </span>
        </div>
      </div>
    </div>
  );
}
