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
          Rakta Business OS utilizes Supabase Cloud PostgREST endpoints protected with JWT bearer tokens. A native Android (Kotlin / Jetpack Compose) or iOS (Swift / SwiftUI) application can directly consume these endpoints:
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
          <div>POST /auth/v1/token?grant_type=password (Supabase Auth)</div>
          <div>GET  /rest/v1/cards?select=*&is_active=eq.true</div>
          <div>POST /rest/v1/cards (User Card Creation via RLS)</div>
          <div>POST /rest/v1/rpc/record_card_event (Rate-Limited Analytics)</div>
          <div>POST /rest/v1/rpc/submit_card_lead (Public Lead Ingestion)</div>
          <div>POST /storage/v1/object/card-assets (Direct Media Upload)</div>
        </div>
      </div>

      {/* Security & Data Preferences */}
      <div className="card-panel">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
          Data Standards & Production Architecture
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={18} color="var(--success)" />
            <span>Supabase PostgreSQL Cloud with strict Row-Level Security (RLS) tenant isolation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={18} color="var(--success)" />
            <span>Cryptographic JWT session authentication with auto-refresh token handling</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={18} color="var(--success)" />
            <span>RFC 2426 compliant vCard 3.0 export protocol</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={18} color="var(--success)" />
            <span>Zero-server runtime: Standalone web client with Supabase Edge Functions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
