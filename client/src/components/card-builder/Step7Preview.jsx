import React from 'react';
import { CheckCircle2, Globe, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPublicCardUrl } from '../../utils/supabaseClient';

export default function Step7Preview({ formData, onPublish, isSubmitting, publishedCard, onNavigate }) {
  const isComplete = !!(formData.full_name && (formData.company_name || formData.company) && formData.phone && formData.email);

  const handlePublishClick = async () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    await onPublish();
  };

  const publicUrl = formData.slug ? getPublicCardUrl(formData.slug) : getPublicCardUrl(formData.username || 'my-card');

  return (
    <div className="card-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: 'var(--success-light)',
          color: 'var(--success-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Step 7: Review & Publish</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Your digital card is ready. Verify the information and publish to generate your live public link.
          </p>
        </div>
      </div>

      {!isComplete && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--danger-light)',
          borderRadius: 'var(--radius-md)',
          color: '#B91C1C',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Missing required fields:</strong> Please ensure Full Name, Company Name, Phone Number, and Email Address are filled in previous steps.
          </div>
        </div>
      )}

      {/* Summary Box */}
      <div style={{
        backgroundColor: 'var(--surface-alt)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Card Owner</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
              {formData.full_name || 'Not provided'}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--secondary)', fontWeight: 600 }}>
              {formData.designation || 'Role not specified'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Company Organization</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
              {formData.company_name || 'Not provided'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {formData.tagline || 'Standard Card'}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Live Card URL</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Globe size={16} color="var(--primary)" />
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--primary)' }}
            >
              {publicUrl}
            </a>
          </div>
        </div>
      </div>

      {publishedCard ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: 'var(--success-light)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--success)'
        }}>
          <CheckCircle2 size={44} color="var(--success-dark)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-dark)', marginBottom: '0.5rem' }}>
            🎉 Digital Card Published Successfully!
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Your digital card is live and accessible worldwide. Anyone scanning your QR code or opening the link will see your updated information.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a
              href={publishedCard.slug ? `/c/${publishedCard.slug}` : `/card/${publishedCard.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <ExternalLink size={16} />
              <span>Open Public Digital Card</span>
            </a>
            <button
              type="button"
              onClick={() => onNavigate('/dashboard/cards')}
              className="btn btn-outline"
            >
              <span>Back to My Cards</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={handlePublishClick}
            disabled={!isComplete || isSubmitting}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '240px', boxShadow: '0 4px 14px rgba(11, 46, 89, 0.35)' }}
            id="btn-publish-card"
          >
            <Sparkles size={18} />
            <span>{isSubmitting ? 'Publishing...' : 'Publish Digital Business Card'}</span>
          </button>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Instant publishing &bull; Edits update immediately in real-time
          </div>
        </div>
      )}
    </div>
  );
}
