import React, { useState, useEffect } from 'react';
import { Printer, Download, X, QrCode, Building, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from '../../context/ToastContext';
import { getPublicCardUrl } from '../../utils/supabaseClient';

export default function PrintableStand({ card, onClose }) {
  const { showToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState('');

  const cardUrl = card?.public_url || (card?.slug ? getPublicCardUrl(card.slug) : (card?.username ? getPublicCardUrl(card.username) : `${window.location.origin}/c/demo`));
  const primaryColor = card?.primary_color || '#0B2E59';

  useEffect(() => {
    if (cardUrl) {
      QRCode.toDataURL(cardUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 600,
        color: {
          dark: primaryColor || '#0B2E59',
          light: '#FFFFFF'
        }
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [cardUrl, primaryColor]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${(card?.company_name || 'company').replace(/[^a-zA-Z0-9_-]/g, '_')}-qr-stand.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('success', 'QR stand poster asset downloaded!');
  };

  return (
    <div className="printable-stand-wrapper">
      {/* Top action toolbar (hidden during print) */}
      <div className="no-print" style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 1000
      }}>
        <button
          onClick={handlePrint}
          className="btn btn-primary"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <Printer size={16} />
          <span>Print Stand Poster</span>
        </button>

        <button
          onClick={handleDownloadImage}
          className="btn btn-outline"
          style={{ backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}
        >
          <Download size={16} />
          <span>Download QR</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* The Printable Poster Design (Clean, Minimal, Corporate White & Navy) */}
      <div className="printable-poster">
        {/* Company Logo */}
        {card?.company_logo ? (
          <img
            src={card.company_logo}
            alt={card.company_name}
            className="printable-company-logo"
          />
        ) : (
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            backgroundColor: 'rgba(11, 46, 89, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Building size={32} color={primaryColor} />
          </div>
        )}

        {/* Company Name */}
        <h2 className="printable-company-name">
          {card?.company_name || 'RUSHI Power Systems Pvt. Ltd.'}
        </h2>

        {/* Tagline / Subtitle */}
        <div className="printable-tagline">
          {card?.tagline || 'ISO 9001:2015 Certified Power Solutions'}
        </div>

        {/* QR Code Container with "Scan Me" Badge */}
        <div className="printable-qr-container">
          <div className="printable-scan-badge">
            Scan Me
          </div>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code"
              style={{ width: '240px', height: '240px', display: 'block' }}
            />
          ) : (
            <div style={{ width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Generating QR...
            </div>
          )}
        </div>

        {/* Headline */}
        <h3 className="printable-title">
          View Contact Details
        </h3>

        {/* Instruction */}
        <p className="printable-subtitle">
          Point your smartphone camera at the QR code to instantly access and save contact details.
        </p>

        {/* 3-Step Process (Scan QR Code -> Open Instantly -> View Contact Details) */}
        <div className="printable-steps">
          <div className="printable-step-item">
            <div className="printable-step-num" style={{ backgroundColor: primaryColor }}>1</div>
            <div className="printable-step-label">Scan QR Code</div>
          </div>

          <div className="printable-step-item">
            <div className="printable-step-num" style={{ backgroundColor: primaryColor }}>2</div>
            <div className="printable-step-label">Open Instantly</div>
          </div>

          <div className="printable-step-item">
            <div className="printable-step-num" style={{ backgroundColor: primaryColor }}>3</div>
            <div className="printable-step-label">Save Contact</div>
          </div>
        </div>

        {/* Contact summary footnote */}
        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span>{card?.phone}</span>
          <span>&bull;</span>
          <span>{card?.email}</span>
          {card?.website && (
            <>
              <span>&bull;</span>
              <span>{card.website.replace(/^https?:\/\//, '')}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
