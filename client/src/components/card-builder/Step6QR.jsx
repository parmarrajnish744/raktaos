import React, { useState, useEffect } from 'react';
import { QrCode, Download, Copy, Check, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from '../../context/ToastContext';
import { getPublicCardUrl } from '../../utils/supabaseClient';
import { generateCardSlug } from '../../utils/slugGenerator';

export default function Step6QR({ formData, onChange, onOpenPrintModal }) {
  const { showToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Automatically assign unique non-guessable slug if not yet set
  useEffect(() => {
    if (!formData.slug) {
      const autoSlug = generateCardSlug(6);
      onChange('slug', autoSlug);
    }
  }, [formData.slug, onChange]);

  const activeSlug = formData.slug || 'AB72KQ';
  const cardUrl = getPublicCardUrl(activeSlug);

  useEffect(() => {
    if (cardUrl) {
      QRCode.toDataURL(cardUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 400,
        color: {
          dark: formData.primary_color || '#0B2E59',
          light: '#FFFFFF'
        }
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [cardUrl, formData.primary_color]);

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `card-${activeSlug}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('success', 'High-res QR Code PNG downloaded!');
  };

  const handleDownloadSVG = async () => {
    try {
      const svg = await QRCode.toString(cardUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: formData.primary_color || '#0B2E59',
          light: '#FFFFFF'
        }
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `card-${activeSlug}-qr.svg`;
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
      showToast('success', 'Card URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="card-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: 'var(--primary-subtle)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <QrCode size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Step 6: Unique QR Code & Public URL</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Each card automatically receives a permanent, cryptographically non-guessable public address.
          </p>
        </div>
      </div>

      {/* Automated Non-Guessable URL Box */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Automated Public URL
          </label>
          <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem' }}>
            <ShieldCheck size={12} />
            <span>Permanent Non-Guessable Slug</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            readOnly
            className="form-input"
            style={{ backgroundColor: 'var(--surface-alt)', fontWeight: 600, color: 'var(--primary)' }}
            value={cardUrl}
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-outline"
            style={{ flexShrink: 0 }}
            title="Copy URL"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <span className="form-helper">
          This permanent address is automatically locked to your QR code. Updating your profile information in the future will never alter this link or require reprinting.
        </span>
      </div>

      {/* QR Code Preview & Action Box */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: 'var(--surface-alt)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '1rem',
          border: '1px solid var(--border)'
        }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Dynamic QR" style={{ width: '200px', height: '200px', display: 'block' }} />
          ) : (
            <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Generating QR...
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
          {formData.company_name || formData.company || 'Your Company'}
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {cardUrl}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="btn btn-primary btn-sm"
          >
            <Download size={14} />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSVG}
            className="btn btn-outline btn-sm"
          >
            <Download size={14} />
            <span>Download Vector SVG</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-outline btn-sm"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          {onOpenPrintModal && (
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="btn btn-secondary btn-sm"
            >
              <Printer size={14} />
              <span>Printable Stand Poster</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
