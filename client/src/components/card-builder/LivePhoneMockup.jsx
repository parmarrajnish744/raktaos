import React from 'react';
import DigitalCard from '../card-ui/DigitalCard';
import { Smartphone } from 'lucide-react';

export default function LivePhoneMockup({ card, addresses, socialLinks }) {
  return (
    <div className="phone-mockup-wrapper">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.875rem',
        fontSize: '0.8125rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em'
      }}>
        <Smartphone size={16} color="var(--secondary)" />
        <span>Live Real-Time Phone Preview</span>
      </div>

      <div className="phone-mockup-device">
        <div className="phone-notch" />
        <div className="phone-mockup-screen">
          <DigitalCard
            card={card}
            addresses={addresses}
            socialLinks={socialLinks}
            isPreview={true}
          />
        </div>
      </div>

      <div style={{
        marginTop: '0.75rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        Preview reflects live changes instantly
      </div>
    </div>
  );
}
