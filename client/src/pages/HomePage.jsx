import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  QrCode,
  Download,
  Share2,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Building,
  BarChart3,
  Layers,
  Zap
} from 'lucide-react';
import DigitalCard from '../components/card-ui/DigitalCard';

export default function HomePage({ onNavigate }) {
  const [activeFaq, setActiveFaq] = useState(0);

  // Demo card state for interactive hero preview
  const demoCard = {
    id: 'demo-hero-card',
    username: 'sudheer-borra',
    full_name: 'Sudheer Borra',
    designation: 'Managing Director',
    phone: '+91 98765 43210',
    alternate_phone: '+91 98765 43211',
    email: 'sudheer.borra@rushipower.com',
    whatsapp: '+919876543210',
    website: 'https://www.rushipower.com',
    company_name: 'RUSHI Power Systems Pvt. Ltd.',
    company_logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
    company_description: 'Pioneering turnkey electrical systems, industrial substations, and smart grid automation.',
    industry: 'Electrical & Energy Engineering',
    tagline: 'ISO 9001:2015 Certified Power Solutions',
    theme: 'corporate-blue',
    primary_color: '#0B2E59',
    secondary_color: '#2563EB',
    public_url: `${window.location.origin}/card/sudheer-borra`
  };

  const demoAddresses = [
    {
      id: 'addr-1',
      type: 'Registered Office',
      address: 'Plot No. 42, Phase-II, Industrial Development Area, Cherlapally',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '500051'
    },
    {
      id: 'addr-2',
      type: 'Factory Office',
      address: 'Survey No. 128/A, Tech Industrial Zone, Medchal Malkajgiri',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '501401'
    }
  ];

  const demoSocials = [
    { id: 'soc-1', platform: 'linkedin', url: 'https://linkedin.com', is_active: 1 },
    { id: 'soc-2', platform: 'whatsapp', url: 'https://wa.me/919876543210', is_active: 1 },
    { id: 'soc-3', platform: 'twitter', url: 'https://x.com', is_active: 1 },
    { id: 'soc-4', platform: 'facebook', url: 'https://facebook.com', is_active: 1 },
    { id: 'soc-5', platform: 'youtube', url: 'https://youtube.com', is_active: 1 }
  ];

  const faqs = [
    {
      q: 'Does the recipient need to download an application to view or save my card?',
      a: 'No app is needed! When someone scans your QR code or taps your link, the card opens instantly in any mobile or desktop web browser. A single tap on "Download vCard" automatically saves your contact details directly to their phonebook (iOS, Android, Outlook).'
    },
    {
      q: 'Can I add multiple office and factory addresses with Google Maps?',
      a: 'Yes. You can add your Registered Corporate Office, Factory Facilities, and regional branches. Every location automatically receives an interactive "View on Map" button that opens Google Maps with GPS navigation.'
    },
    {
      q: 'Can I change my phone number or company information later?',
      a: 'Yes, anytime. As soon as you update any details in your dashboard, your digital business card and QR code immediately reflect the changes in real-time. You never have to reprint paper cards again.'
    },
    {
      q: 'Can this platform be used for an entire company or sales team?',
      a: 'Yes! Rakta Business OS includes multi-card support, role-based administration, team card centralization, and unified branding controls.'
    },
    {
      q: 'Is there a printable QR card design for office counters and desks?',
      a: 'Yes, our QR Studio includes a dedicated printable acrylic stand / desk poster generator matching professional corporate standards with "Scan Me" badges and 3-step instructions.'
    }
  ];

  return (
    <div style={{ flex: 1 }}>
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Copy */}
            <div>
              <div className="hero-pill-badge">
                <Sparkles size={14} color="var(--secondary)" />
                <span>Next-Generation Digital Business Cards</span>
              </div>

              <h1 className="hero-title">
                Your Business Card. <br />
                <span style={{ color: 'var(--secondary)' }}>Digitally Connected.</span>
              </h1>

              <p className="hero-subtitle">
                Create a professional digital business card, share it instantly and let your customers save your contact details with one scan.
              </p>

              <div className="hero-buttons-row">
                <button
                  onClick={() => onNavigate('/register')}
                  className="btn btn-primary btn-lg"
                  id="hero-create-btn"
                >
                  <span>Create Your Digital Card</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => onNavigate('/card/sudheer-borra')}
                  className="btn btn-outline btn-lg"
                  id="hero-demo-btn"
                >
                  <Smartphone size={18} />
                  <span>View Live Demo</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Dynamic QR Generator</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>RFC 2426 vCard Download</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--success)' }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Google Maps Multi-Office</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Smartphone Mockup with Digital Card */}
            <div className="hero-visual-wrap">
              {/* Floating Badge Left */}
              <div className="hero-floating-card hero-card-left">
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Download size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>1-Tap vCard Save</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>iOS & Android Native</div>
                </div>
              </div>

              {/* Floating Badge Right */}
              <div className="hero-floating-card hero-card-right">
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'var(--secondary-light)',
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <QrCode size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Dynamic QR Code</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Error-corrected vector</div>
                </div>
              </div>

              {/* Phone Frame */}
              <div className="phone-mockup-device" style={{ height: '640px', width: '340px' }}>
                <div className="phone-notch" />
                <div className="phone-mockup-screen">
                  <DigitalCard
                    card={demoCard}
                    addresses={demoAddresses}
                    socialLinks={demoSocials}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (Direct 3-step explanation from reference) */}
      <section className="how-it-works-section">
        <div className="container text-center">
          <span className="section-tag">Frictionless Interaction</span>
          <h2 className="section-heading">How Digital Cards Work</h2>
          <p className="section-desc">
            No mobile applications to install, no paper to print. Just instant connectivity for your customers.
          </p>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number-badge">1</div>
              <h3 className="step-card-title">Scan QR Code</h3>
              <p className="step-card-desc">
                Your prospect scans your unique QR code using their standard smartphone camera or taps your digital link.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number-badge">2</div>
              <h3 className="step-card-title">Open Instantly</h3>
              <p className="step-card-desc">
                Your branded digital card opens seamlessly with your profile, company logo, ISO tagline, and active contact options.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number-badge">3</div>
              <h3 className="step-card-title">View & Save Contact</h3>
              <p className="step-card-desc">
                One tap on "Download vCard" saves your full contact info into their phone, or they can call, WhatsApp, or map your office directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section className="features-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <span className="section-tag">Built for Modern Business</span>
            <h2 className="section-heading">Everything You Need In A Digital Card</h2>
            <p className="section-desc">
              Engineered with commercial SaaS-grade architecture, ready for personal use, high-growth sales teams, and corporate enterprises.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <Download size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dynamic vCard (.vcf)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Complies strictly with RFC 2426 vCard standards. Automatically imports names, company, mobile, landline, email, and postal addresses into iOS and Android contacts.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <QrCode size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>High-Res QR Code Studio</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Generate customized, high-resolution QR codes in PNG and vector SVG format. Download or print desk stands with "Scan Me" badges.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <MapPin size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Multi-Office Google Maps</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Add your Registered Office, Factory Facilities, and Branch Locations with dynamic Google Maps directions for every address.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <MessageCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Click-to-Connect Channels</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Ergonomic 1-tap action buttons for direct phone calls, WhatsApp messages with prefilled introduction text, email drafts, and corporate websites.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Real-Time Card Analytics</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Track total profile views, QR scans, vCard contact downloads, and click distribution across WhatsApp, phone, email, and directions.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mobile App Ready API</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Built with a clean headless RESTful architecture so the same backend seamlessly powers future native Android and iOS mobile applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BUSINESS USE CASES */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--surface)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <span className="section-tag">Industry Applications</span>
            <h2 className="section-heading">Designed for Every Industry</h2>
            <p className="section-desc">
              From industrial manufacturing plants to fast-paced executive networking.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                title: 'Engineering & Manufacturing',
                desc: 'Showcase company registrations, GST details, multiple factory locations, and ISO certifications on one professional card.',
                tag: 'Industrial'
              },
              {
                title: 'Corporate Executives & Founders',
                desc: 'Make unforgettable first impressions at conferences, board meetings, and client introductions with premium branded cards.',
                tag: 'Leadership'
              },
              {
                title: 'Sales & Field Teams',
                desc: 'Empower sales reps to share complete contact info and catalog websites instantly without physical paper waste.',
                tag: 'Revenue'
              },
              {
                title: 'Offices & Reception Counters',
                desc: 'Display professional printable QR stands at reception desks, conference booths, and trade show acrylic displays.',
                tag: 'Front Desk'
              }
            ].map((useCase, idx) => (
              <div key={idx} className="card-panel card-panel-hover">
                <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
                  {useCase.tag}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{useCase.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section className="pricing-section">
        <div className="container">
          <div className="text-center">
            <span className="section-tag">Simple & Transparent</span>
            <h2 className="section-heading">Plans for Individuals & Teams</h2>
            <p className="section-desc">
              Start free today and upgrade as your networking and team requirements scale.
            </p>
          </div>

          <div className="pricing-grid">
            {/* Free Plan */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Free Starter</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>For individuals starting digital networking</p>
              <div className="pricing-price">$0<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> 1 Active Digital Card</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Unlimited QR Scans</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> vCard 3.0 Download</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Call, WhatsApp, Email links</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> 2 Office Address locations</li>
              </ul>
              <button
                onClick={() => onNavigate('/register')}
                className="btn btn-outline btn-block"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Plan (Featured) */}
            <div className="pricing-card pricing-card-featured">
              <div className="pricing-featured-badge">Most Popular</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>Pro Professional</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>For business owners and active professionals</p>
              <div className="pricing-price">$9<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Up to 5 Digital Cards</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> High-Res Vector SVG & PNG QR</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Printable QR Stand Poster</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Advanced Click & Scan Analytics</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Custom Themes & Brand Colors</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Unlimited Offices & Maps</li>
              </ul>
              <button
                onClick={() => onNavigate('/register')}
                className="btn btn-primary btn-block"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Business Plan */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Business Enterprise</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>For corporate companies and sales teams</p>
              <div className="pricing-price">$29<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Unlimited Team Cards</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Company Dashboard & Controls</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Centralized Brand Management</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Bulk QR Poster Generation</li>
                <li className="pricing-feature-item"><CheckCircle2 size={16} color="var(--success)" /> Dedicated API Access</li>
              </ul>
              <button
                onClick={() => onNavigate('/contact')}
                className="btn btn-outline btn-block"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--surface-alt)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <span className="section-tag">Frequently Asked Questions</span>
            <h2 className="section-heading">Everything You Need to Know</h2>
          </div>

          <div style={{ display: 'flex', flexDirectiom: 'column', gap: '0.875rem' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--primary)'
                  }}
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {activeFaq === idx && (
                  <div style={{
                    padding: '0 1.5rem 1.25rem',
                    fontSize: '0.9375rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '0.875rem'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. HIGH CONVERTING CTA BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, #0B2E59 0%, #153E75 100%)',
        color: '#FFFFFF',
        padding: '5rem 0',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to upgrade your business card?
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, marginBottom: '2.25rem' }}>
            Join forward-thinking entrepreneurs and corporate leaders creating high-impact digital cards that save contacts with a single scan.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('/register')}
              className="btn btn-secondary btn-lg"
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
            >
              <span>Create Your Digital Card Free</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('/card/sudheer-borra')}
              className="btn btn-outline btn-lg"
              style={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }}
            >
              <span>Explore Interactive Demo</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
