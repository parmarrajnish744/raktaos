import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function PricingPage({ onNavigate }) {
  return (
    <div style={{ flex: 1, padding: '4rem 0' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: '4rem' }}>
          <span className="section-tag">Plans & Pricing</span>
          <h1 className="section-heading" style={{ fontSize: '2.75rem' }}>
            Scale Your Digital Identity
          </h1>
          <p className="section-desc">
            Choose the right plan for your personal brand, growing business, or enterprise sales organization.
          </p>
        </div>

        <div className="pricing-grid">
          {/* Free Starter */}
          <div className="pricing-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Free Starter</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Ideal for testing the waters of digital networking</p>
            <div className="pricing-price">$0<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <ul className="pricing-features-list">
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> 1 Active Digital Card</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> High-Res QR Code</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Instant vCard 3.0 Download</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Click-to-Call, WhatsApp, Email</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> 2 Office Location Addresses</li>
            </ul>
            <button
              onClick={() => onNavigate('/register')}
              className="btn btn-outline btn-block"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro */}
          <div className="pricing-card pricing-card-featured">
            <div className="pricing-featured-badge">Most Popular</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>Pro Professional</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>For executives, founders, and active dealmakers</p>
            <div className="pricing-price">$9<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <ul className="pricing-features-list">
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Up to 5 Digital Cards</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Custom Branding Colors & Fonts</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Vector SVG & PNG QR Downloads</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Printable QR Stand Poster Generator</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Real-Time Analytics & Click Tracking</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Unlimited Office & Branch Locations</li>
            </ul>
            <button
              onClick={() => onNavigate('/register')}
              className="btn btn-primary btn-block"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Enterprise */}
          <div className="pricing-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Business Enterprise</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>For corporate teams and sales forces</p>
            <div className="pricing-price">$29<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <ul className="pricing-features-list">
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Unlimited Team Cards</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Company Dashboard & Role Permissions</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Bulk QR Stand Generation</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Centralized Brand & Logo Control</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Dedicated Mobile REST API Access</li>
            </ul>
            <button
              onClick={() => onNavigate('/contact')}
              className="btn btn-outline btn-block"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
