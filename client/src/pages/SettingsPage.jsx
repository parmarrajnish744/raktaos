import React from 'react';
import { Smartphone, Shield, Zap, Globe, Key, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
          Platform & API Settings
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          System architecture specifications and mobile application API integration keys.
        </p>
      </div>

      {/* Mobile App Architecture Section */}
      <div className="card-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
            <Smartphone size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
              Native Mobile App Ready Architecture
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Unified backend RESTful API powering Web, Android, and iOS clients.
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          The backend API exposes standard JSON REST endpoints protected with JWT bearer tokens. A native Android (Kotlin / Jetpack Compose) or iOS (Swift / SwiftUI) application can directly consume these endpoints for:
        </p>

        <div style={{
          backgroundColor: 'var(--surface-alt)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          fontFamily: 'monospace',
          fontSize: '0.8125rem',
          color: 'var(--text)',
          lineHeight: 1.8,
          border: '1px solid var(--border)'
        }}>
          <div>POST /api/auth/login</div>
          <div>GET  /api/cards</div>
          <div>POST /api/cards</div>
          <div>GET  /api/cards/:id/qr</div>
          <div>GET  /api/public/card/:username</div>
          <div>POST /api/public/cards/:id/scan</div>
        </div>
      </div>

      {/* Security & Data Preferences */}
      <div className="card-panel">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
          Data Standards & Security
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={18} color="var(--success)" />
            <span>RFC 2426 compliant vCard 3.0 export protocol</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={18} color="var(--success)" />
            <span>Bcrypt 10-round salted password hashing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={18} color="var(--success)" />
            <span>SQLite database with persistent Write-Ahead-Logging (WAL)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
