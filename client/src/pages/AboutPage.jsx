import React from 'react';
import { Target, Users, ShieldCheck, Sparkles, Building } from 'lucide-react';

export default function AboutPage({ onNavigate }) {
  return (
    <div style={{ flex: 1, padding: '4rem 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <div className="text-center" style={{ marginBottom: '3.5rem' }}>
          <span className="section-tag">Our Mission</span>
          <h1 className="section-heading" style={{ fontSize: '2.75rem' }}>
            Transforming Professional Connections
          </h1>
          <p className="section-desc">
            We believe traditional paper business cards are obsolete, wasteful, and easily lost. Rakta Business OS bridges physical networking and digital growth for modern enterprises.
          </p>
        </div>

        <div className="card-panel" style={{ marginBottom: '2.5rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
            Create Once &bull; Share Everywhere &bull; Capture Every Lead
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Every year, billions of paper business cards are printed worldwide, with over 88% thrown away within a week. When phone numbers change or companies rebrand, entire batches become landfill waste.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Rakta Business OS</strong> empowers entrepreneurs, MSME owners, engineers, sales directors, and corporate organizations to present their authentic professional identity through interactive digital cards with instant QR scanning, direct WhatsApp lead enquiries, and 1-tap contact saving.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="card-panel">
            <Target size={28} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Our Purpose</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Provide frictionless, reliable contact sharing technology and automated lead generation that requires no app download and works across every device.
            </p>
          </div>

          <div className="card-panel">
            <ShieldCheck size={28} color="var(--secondary)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Standards & Compliance</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Strict adherence to international RFC 2426 vCard standards, enterprise data security, and modern web accessibility.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => onNavigate('/register')}
            className="btn btn-primary btn-lg"
          >
            Get Started with Rakta OS
          </button>
        </div>
      </div>
    </div>
  );
}
