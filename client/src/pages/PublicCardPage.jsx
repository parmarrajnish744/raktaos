import React, { useState, useEffect } from 'react';
import { getPublicCardBySlug, trackCardMetric } from '../services/cardService';
import DigitalCard from '../components/card-ui/DigitalCard';
import { downloadVCardClient } from '../utils/vcard';
import { AlertCircle, CreditCard, ArrowLeft } from 'lucide-react';

export default function PublicCardPage({ slug, username, onNavigate }) {
  const targetIdentifier = slug || username;
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPublicCard() {
      setLoading(true);
      setError(null);
      try {
        const card = await getPublicCardBySlug(targetIdentifier);
        setCardData(card);

        // Update document title for SEO
        const comp = card.company_name || card.company || '';
        document.title = `${card.full_name}${card.designation ? ` | ${card.designation}` : ''}${comp ? ` | ${comp}` : ''}`;

        // Automatically record page view in Supabase
        const cardSlug = card.slug || targetIdentifier;
        trackCardMetric(cardSlug, 'view');

        // Check if opened via QR scan (?scan=1 or ?src=qr)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('scan') === '1' || urlParams.get('src') === 'qr') {
          trackCardMetric(cardSlug, 'scan');
        }

        // Check if reached via vCard download shortcut (?download=vcard or ?action=vcard)
        if (urlParams.get('download') === 'vcard' || urlParams.get('action') === 'vcard') {
          downloadVCardClient(card, card.addresses);
          trackCardMetric(cardSlug, 'download');
        }
      } catch (err) {
        setError(err.message || 'This digital card could not be found.');
      } finally {
        setLoading(false);
      }
    }

    if (targetIdentifier) {
      loadPublicCard();
    }
  }, [targetIdentifier]);

  const handleEventTrack = (eventType) => {
    const cardSlug = cardData?.slug || targetIdentifier;
    if (cardSlug) {
      if (eventType === 'vcard_download') {
        trackCardMetric(cardSlug, 'download');
      } else if (eventType === 'scan') {
        trackCardMetric(cardSlug, 'scan');
      } else {
        trackCardMetric(cardSlug, eventType);
      }
    }
  };

  if (loading) {
    return (
      <div className="card-viewport-wrapper">
        <div style={{ textAlign: 'center', color: '#FFFFFF' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            animation: 'pulse 1.5s infinite'
          }}>
            <CreditCard size={24} color="#FFFFFF" />
          </div>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Loading Digital Business Card...</p>
        </div>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="card-viewport-wrapper">
        <div className="digital-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Card Unavailable
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            {error || 'This digital business card is currently inactive or has been removed.'}
          </p>
          <a href="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={16} />
            <span>Return to Homepage</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card-viewport-wrapper">
      <DigitalCard
        card={cardData}
        addresses={cardData.addresses || []}
        socialLinks={cardData.social_links || []}
        onEventTrack={handleEventTrack}
      />
    </div>
  );
}
