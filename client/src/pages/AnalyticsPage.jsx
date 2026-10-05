import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Eye,
  QrCode,
  Download,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  MapPin,
  Share2,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { getUserCards, getCardAnalytics } from '../services/cardService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load cards list
  useEffect(() => {
    async function loadCards() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const loaded = await getUserCards(user.id);
        setCards(loaded || []);
        if (loaded && loaded.length > 0) {
          // Check URL query param if present
          const urlParams = new URLSearchParams(window.location.search);
          const paramId = urlParams.get('cardId');
          const target = loaded.find((c) => c.id === paramId) || loaded[0];
          setSelectedCardId(target.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        showToast('error', 'Failed to load cards for analytics.');
        setLoading(false);
      }
    }
    loadCards();
  }, [user?.id, showToast]);

  // Load analytics when selectedCardId changes
  useEffect(() => {
    if (!selectedCardId) {
      setLoading(false);
      return;
    }
    async function loadStats() {
      setLoading(true);
      try {
        const data = await getCardAnalytics(selectedCardId);
        setAnalytics(data);
      } catch (err) {
        showToast('error', 'Failed to load card analytics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [selectedCardId, showToast]);

  const activeCard = cards.find((c) => c.id === selectedCardId);

  const clicks = analytics?.clicks || {};
  const totalClicks = Object.values(clicks).reduce((a, b) => a + b, 0);

  const clickRows = [
    { label: 'Customer Lead Enquiries', count: clicks.lead_submit || 0, icon: Inbox, color: '#E63946' },
    { label: 'WhatsApp Inquiries', count: clicks.whatsapp_click || 0, icon: MessageCircle, color: '#059669' },
    { label: 'Direct Phone Calls', count: clicks.call_click || 0, icon: Phone, color: '#16A34A' },
    { label: 'Email Messages', count: clicks.email_click || 0, icon: Mail, color: '#2563EB' },
    { label: 'Official Website Visits', count: clicks.website_click || 0, icon: Globe, color: '#4F46E5' },
    { label: 'Google Maps Navigation', count: clicks.map_click || 0, icon: MapPin, color: '#D97706' },
    { label: 'Card Shares', count: clicks.share_click || 0, icon: Share2, color: '#0B2E59' }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
            Engagement Analytics
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time tracking of impressions, QR scans, and client contact actions.
          </p>
        </div>

        {cards.length > 0 && (
          <div style={{ minWidth: '220px' }}>
            <select
              className="form-select"
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.company_name})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading performance telemetry...
        </div>
      ) : !activeCard ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          No cards available for analytics.
        </div>
      ) : (
        <>
          {/* Top Counters Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                <Eye size={24} />
              </div>
              <div>
                <div className="metric-val">{analytics?.views || 0}</div>
                <div className="metric-label">Profile Views</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                <QrCode size={24} />
              </div>
              <div>
                <div className="metric-val">{analytics?.scans || 0}</div>
                <div className="metric-label">QR Code Scans</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-dark)' }}>
                <Download size={24} />
              </div>
              <div>
                <div className="metric-val">{analytics?.downloads || 0}</div>
                <div className="metric-label">vCard Downloads</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="metric-val">{totalClicks}</div>
                <div className="metric-label">Total Action Clicks</div>
              </div>
            </div>
          </div>

          {/* Click Channels Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
            <div className="card-panel">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>
                Action Channel Breakdown
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                How prospects interact with your contact details when viewing your digital card.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {clickRows.map((row) => {
                  const Icon = row.icon;
                  const percentage = totalClicks > 0 ? Math.round((row.count / totalClicks) * 100) : 0;
                  return (
                    <div key={row.label}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                          <Icon size={16} color={row.color} />
                          <span>{row.label}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                          {row.count} clicks ({percentage}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percentage}%`,
                            backgroundColor: row.color,
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card Summary Card */}
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>
                  Card Details
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: activeCard.primary_color || 'var(--primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.25rem'
                  }}>
                    {activeCard.company_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{activeCard.full_name}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {activeCard.designation} &bull; {activeCard.company_name}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Public URL:</strong> /c/{activeCard.slug || activeCard.username}</div>
                  <div><strong>Status:</strong> <span className="badge badge-success">{activeCard.status || 'active'}</span></div>
                  <div><strong>Primary Color:</strong> <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: activeCard.primary_color, borderRadius: '2px', marginRight: '6px' }} />{activeCard.primary_color}</div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <a
                  href={`/c/${activeCard.slug || activeCard.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-block"
                >
                  <span>Open Live Card</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
