import React from 'react';
import { CreditCard, Shield, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800
              }}>
                R
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Rakta <span style={{ color: '#F4A261' }}>Business OS</span>
              </span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 320, marginBottom: '1.25rem' }}>
              The all-in-one digital card, smart QR code, and customer lead engine designed specifically for Indian SMEs, manufacturers, and professionals.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8125rem' }}>
              <Shield size={16} />
              <span>Enterprise Grade Security & RFC 2426 vCard Compliant</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links">
              <li><button onClick={() => onNavigate('/')} className="footer-link">Home</button></li>
              <li><button onClick={() => onNavigate('/features')} className="footer-link">Features</button></li>
              <li><button onClick={() => onNavigate('/pricing')} className="footer-link">Pricing</button></li>
              <li><button onClick={() => onNavigate('/card/sudheer-borra')} className="footer-link">Live Demo Card</button></li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div>
            <h4 className="footer-col-title">Solutions</h4>
            <ul className="footer-links">
              <li><span className="footer-link" style={{ cursor: 'default' }}>Corporate Teams</span></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>Sales & Networking</span></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>Industrial & Engineering</span></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>Printable QR Stands</span></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links">
              <li><button onClick={() => onNavigate('/about')} className="footer-link">About Us</button></li>
              <li><button onClick={() => onNavigate('/contact')} className="footer-link">Contact & Support</button></li>
              <li><button onClick={() => onNavigate('/login')} className="footer-link">User Login</button></li>
              <li><button onClick={() => onNavigate('/register')} className="footer-link">Get Started Free</button></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Rakta Business OS. All rights reserved. Powering Indian SMEs.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Crafted with</span>
            <Heart size={14} color="#EF4444" fill="#EF4444" />
            <span>for Indian business growth</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
