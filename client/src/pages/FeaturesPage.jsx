import React from 'react';
import {
  Download,
  QrCode,
  MapPin,
  MessageCircle,
  BarChart3,
  Smartphone,
  Shield,
  Palette,
  Share2,
  Globe,
  Zap,
  Printer
} from 'lucide-react';

export default function FeaturesPage({ onNavigate }) {
  const features = [
    {
      icon: Download,
      title: 'Real RFC 2426 vCard Generation',
      desc: 'Generates standard .vcf files dynamically from your card data. A single click saves contacts natively into Apple iOS Contacts, Google Android Contacts, and Microsoft Outlook with zero manual typing.'
    },
    {
      icon: QrCode,
      title: 'High-Resolution Vector QR Codes',
      desc: 'Each card receives a permanent, error-corrected QR code pointing to its public URL. Download as crisp PNG for digital use or vector SVG for professional offset printing.'
    },
    {
      icon: Printer,
      title: 'Printable Acrylic Stand Posters',
      desc: 'Create ready-to-print desk cards and reception posters with your company logo, QR code, "Scan Me" badge, and 3-step scan instructions matching corporate standards.'
    },
    {
      icon: MapPin,
      title: 'Multi-Location Google Maps Directions',
      desc: 'Display Registered Offices, Factory Facilities, and regional warehouses. Every address dynamically generates a 1-tap Google Maps directions link with GPS navigation.'
    },
    {
      icon: MessageCircle,
      title: 'Direct WhatsApp & Phone Integration',
      desc: 'Prospects can trigger direct telephone calls or initiate WhatsApp conversations with pre-configured introductory text messages to streamline deal closures.'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Engagement Analytics',
      desc: 'Monitor impressions, QR scans, contact vCard downloads, and see which communication channels (WhatsApp, Call, Website, Map) your clients engage with most.'
    },
    {
      icon: Palette,
      title: 'Custom Brand & Theme Studio',
      desc: 'Choose from 6 curated corporate presets or customize your primary brand color, secondary action color, typography, and button shape to match your visual identity.'
    },
    {
      icon: Share2,
      title: 'Universal Web Sharing',
      desc: 'Leverages the native Web Share API on mobile devices and provides an interactive modal with direct channels (WhatsApp, Telegram, LinkedIn, Copy Link) on desktop.'
    },
    {
      icon: Zap,
      title: 'API-Ready Headless Architecture',
      desc: 'The backend RESTful API is decoupled from the frontend, engineered to power future native Android and iOS mobile applications without changing data schemas.'
    }
  ];

  return (
    <div style={{ flex: 1, padding: '4rem 0' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: '4rem' }}>
          <span className="section-tag">Feature Capabilities</span>
          <h1 className="section-heading" style={{ fontSize: '2.75rem' }}>
            Built for High-Impact Corporate Networking
          </h1>
          <p className="section-desc">
            Explore the comprehensive suite of tools built into Rakta Business OS to elevate your business identity.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="feature-box">
                <div className="feature-icon-wrapper">
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--primary)' }}>
                  {feat.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{
          marginTop: '5rem',
          padding: '3rem 2rem',
          backgroundColor: 'var(--primary-subtle)',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
            Ready to experience next-generation business cards?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Create your personalized digital card in less than 2 minutes with our intuitive 7-step builder.
          </p>
          <button
            onClick={() => onNavigate('/register')}
            className="btn btn-primary btn-lg"
          >
            Create Your Card Now
          </button>
        </div>
      </div>
    </div>
  );
}
