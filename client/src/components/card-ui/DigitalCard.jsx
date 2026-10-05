import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Download,
  Share2,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Building,
  Briefcase,
  Send
} from 'lucide-react';
import { SocialIcon } from '../common/SocialIcons';
import ShareModal from './ShareModal';
import QRModal from './QRModal';
import SendEnquiryModal from './SendEnquiryModal';
import { downloadVCardClient } from '../../utils/vcard';
import { useToast } from '../../context/ToastContext';

import { getPublicCardUrl } from '../../utils/supabaseClient';

export default function DigitalCard({
  card,
  addresses = [],
  socialLinks = [],
  onEventTrack,
  isPreview = false
}) {
  const { showToast } = useToast();
  const [shareOpen, setShareOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  if (!card) return null;

  const primaryColor = card.primary_color || '#0B2E59';
  const secondaryColor = card.secondary_color || '#2563EB';

  const cardUrl = card.public_url || (card.slug ? getPublicCardUrl(card.slug) : (card.username ? getPublicCardUrl(card.username) : `${window.location.origin}/c/card`));

  // Track button click
  const handleActionClick = (eventType, url, isExternal = false) => {
    if (onEventTrack) {
      onEventTrack(eventType);
    }
    if (url && !isExternal) {
      window.location.href = url;
    }
  };

  // Dynamic RFC vCard download handler
  const handleVCardDownload = () => {
    if (onEventTrack) onEventTrack('vcard_download');
    const addrList = (addresses && addresses.length > 0) ? addresses : (card.addresses || []);
    downloadVCardClient(card, addrList);
    showToast('success', `Contact saved for ${card.full_name || 'card'}!`);
  };

  // Web Share or Modal Fallback
  const handleShare = async () => {
    if (onEventTrack) onEventTrack('share_click');
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.full_name} | ${card.company_name}`,
          text: `Here is the digital business card of ${card.full_name}, ${card.designation} at ${card.company_name}:`,
          url: cardUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setShareOpen(true);
        }
      }
    } else {
      setShareOpen(true);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      showToast('success', `${fieldName} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // Formatted URLs
  const cleanPhone = (card.phone || '').replace(/[^0-9+]/g, '');
  const cleanAltPhone = (card.alternate_phone || '').replace(/[^0-9+]/g, '');
  const cleanWa = (card.whatsapp || card.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanWa
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hi ${card.full_name}, I connected with your digital business card.`)}`
    : '';

  return (
    <div
      className="digital-card"
      style={{
        '--card-primary': primaryColor,
        '--card-secondary': secondaryColor,
        fontFamily: card.font_family || 'Inter, sans-serif'
      }}
    >
      {/* 1. Header Banner (Company Branding) */}
      <div className="card-header-banner">
        {/* Company Logo */}
        <div className="card-company-logo-wrap">
          {card.company_logo ? (
            <img src={card.company_logo} alt={card.company_name || 'Logo'} />
          ) : (
            <Building size={36} color={primaryColor} />
          )}
        </div>

        {/* Company Name */}
        <h2 className="card-company-name">
          {card.company_name || 'Your Company Name'}
        </h2>

        {/* ISO / Subtitle Tagline */}
        {(card.tagline || card.industry) && (
          <div className="card-company-tagline">
            {card.tagline || card.industry}
          </div>
        )}
      </div>

      {/* 2. Personal Identity Section */}
      <div className="card-profile-section">
        <div className="card-profile-avatar-wrap">
          {card.profile_photo ? (
            <img src={card.profile_photo} alt={card.full_name || 'Profile'} />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--primary-subtle)',
              color: primaryColor,
              fontSize: '2rem',
              fontWeight: 800
            }}>
              {(card.full_name || 'U').charAt(0)}
            </div>
          )}
        </div>

        <h1 className="card-person-name">
          {card.full_name || 'Your Full Name'}
        </h1>

        <div className="card-person-designation">
          {card.designation || 'Your Designation / Role'}
        </div>

        <div className="card-person-company-sub">
          {card.company_name}
        </div>
      </div>

      {/* 3. Primary CTAs: Download vCard & Send Enquiry */}
      <div className="card-primary-cta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
        <button
          type="button"
          onClick={handleVCardDownload}
          className="btn-vcard-download"
          id="btn-download-vcard"
          title="Save contact directly to your phone"
        >
          <Download size={18} />
          <span>Save Contact</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onEventTrack) onEventTrack('enquiry_open');
            setEnquiryOpen(true);
          }}
          className="btn-vcard-download"
          style={{
            backgroundColor: 'var(--surface-alt)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xs)'
          }}
          id="btn-send-enquiry"
          title="Send an enquiry message directly"
        >
          <Send size={16} color={primaryColor} />
          <span>Send Enquiry</span>
        </button>
      </div>

      {/* 4. Quick Action Tiles (Call, WhatsApp, Email, Website) */}
      <div className="card-quick-actions">
        {/* Call */}
        <a
          href={cleanPhone ? `tel:${cleanPhone}` : undefined}
          onClick={() => handleActionClick('call_click', `tel:${cleanPhone}`)}
          className="action-tile action-tile-call"
          title="Call Now"
        >
          <div className="action-tile-icon">
            <Phone size={18} />
          </div>
          <span className="action-tile-label">Call</span>
        </a>

        {/* WhatsApp */}
        <a
          href={waUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleActionClick('whatsapp_click', waUrl, true)}
          className="action-tile action-tile-whatsapp"
          title="Chat on WhatsApp"
        >
          <div className="action-tile-icon">
            <MessageCircle size={18} />
          </div>
          <span className="action-tile-label">WhatsApp</span>
        </a>

        {/* Email */}
        <a
          href={card.email ? `mailto:${card.email}` : undefined}
          onClick={() => handleActionClick('email_click', `mailto:${card.email}`)}
          className="action-tile action-tile-email"
          title="Send Email"
        >
          <div className="action-tile-icon">
            <Mail size={18} />
          </div>
          <span className="action-tile-label">Email</span>
        </a>

        {/* Website */}
        <a
          href={card.website || undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleActionClick('website_click', card.website, true)}
          className="action-tile action-tile-website"
          title="Visit Website"
        >
          <div className="action-tile-icon">
            <Globe size={18} />
          </div>
          <span className="action-tile-label">Website</span>
        </a>
      </div>

      {/* 5. Main Card Content Body */}
      <div className="card-body">
        {/* Contact Information Section */}
        <div>
          <div className="card-section-title">
            <Phone size={14} />
            <span>Contact Details</span>
          </div>

          {/* Phone Row */}
          {card.phone && (
            <div className="contact-item-row">
              <a
                href={`tel:${cleanPhone}`}
                onClick={() => handleActionClick('call_click')}
                className="contact-item-left"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="contact-item-icon">
                  <Phone size={16} />
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Mobile Phone</span>
                  <span className="contact-item-val">{card.phone}</span>
                </div>
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(card.phone, 'Phone')}
                className="btn btn-ghost btn-icon"
                title="Copy phone"
              >
                {copiedField === 'Phone' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Alternate Phone Row */}
          {card.alternate_phone && (
            <div className="contact-item-row">
              <a
                href={`tel:${cleanAltPhone}`}
                onClick={() => handleActionClick('call_click')}
                className="contact-item-left"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="contact-item-icon">
                  <Phone size={16} />
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Alternate / Office Phone</span>
                  <span className="contact-item-val">{card.alternate_phone}</span>
                </div>
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(card.alternate_phone, 'Alternate Phone')}
                className="btn btn-ghost btn-icon"
                title="Copy phone"
              >
                {copiedField === 'Alternate Phone' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Email Row */}
          {card.email && (
            <div className="contact-item-row">
              <a
                href={`mailto:${card.email}`}
                onClick={() => handleActionClick('email_click')}
                className="contact-item-left"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="contact-item-icon">
                  <Mail size={16} />
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Email Address</span>
                  <span className="contact-item-val">{card.email}</span>
                </div>
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(card.email, 'Email')}
                className="btn btn-ghost btn-icon"
                title="Copy email"
              >
                {copiedField === 'Email' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Website Row */}
          {card.website && (
            <div className="contact-item-row">
              <a
                href={card.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleActionClick('website_click')}
                className="contact-item-left"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="contact-item-icon">
                  <Globe size={16} />
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Company Website</span>
                  <span className="contact-item-val">{card.website.replace(/^https?:\/\//, '')}</span>
                </div>
              </a>
              <a
                href={card.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-icon"
                title="Open website"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

        {/* Office Locations with Dynamic Google Maps Directions */}
        {addresses && addresses.length > 0 && (
          <div>
            <div className="card-section-title">
              <MapPin size={14} />
              <span>Office & Facility Locations</span>
            </div>

            {addresses.map((addr, idx) => {
              const fullAddr = [addr.address, addr.city, addr.state, addr.pincode, addr.country]
                .filter(Boolean)
                .join(', ');

              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr || card.company_name)}`;

              return (
                <div key={addr.id || idx} className="office-card">
                  <div className="office-header">
                    <span className="office-badge">
                      {addr.type || (idx === 0 ? 'Registered Office' : 'Factory Office')}
                    </span>
                  </div>

                  <p className="office-address-text">
                    {fullAddr || 'No detailed address specified.'}
                  </p>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleActionClick('map_click', mapsUrl, true)}
                    className="btn-map-directions"
                  >
                    <MapPin size={13} />
                    <span>View on Map</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Products & Services Section (Phase I) */}
        {card.services && card.services.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="card-section-title">
              <Briefcase size={14} />
              <span>Products & Services</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {card.services.map((srv, idx) => (
                <div key={srv.id || idx} className="office-card" style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                      {srv.title}
                    </div>
                    {srv.price && (
                      <span className="badge badge-success" style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                        {srv.price}
                      </span>
                    )}
                  </div>
                  {srv.description && (
                    <p style={{ margin: '0.35rem 0 0.5rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {srv.description}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (onEventTrack) onEventTrack('lead_click');
                      setEnquiryOpen(true);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '0.25rem', alignSelf: 'flex-start', fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                  >
                    <span>Enquire About This</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Links */}
        {socialLinks && socialLinks.length > 0 && (
          <div>
            <div className="card-section-title">
              <Share2 size={14} />
              <span>Connect on Social Media</span>
            </div>

            <div className="social-grid">
              {socialLinks
                .filter((s) => s.is_active !== 0 && s.url)
                .map((soc, idx) => {
                  return (
                    <a
                      key={soc.id || idx}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon-btn"
                      title={soc.platform}
                    >
                      <SocialIcon platform={soc.platform} size={18} />
                    </a>
                  );
                })}
            </div>
          </div>
        )}

        {/* Company Description */}
        {card.company_description && (
          <div>
            <div className="card-section-title">
              <Briefcase size={14} />
              <span>About Company</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {card.company_description}
            </p>
          </div>
        )}
      </div>

      {/* 6. Bottom Floating Action Bar (Share + Show QR) */}
      <div className="card-bottom-actions">
        <button
          type="button"
          onClick={handleShare}
          className="btn-card-action"
          id="btn-share-card"
        >
          <Share2 size={16} color={primaryColor} />
          <span>Share Card</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onEventTrack) onEventTrack('scan');
            setQrOpen(true);
          }}
          className="btn-card-action"
          id="btn-show-qr"
        >
          <QrCode size={16} color={primaryColor} />
          <span>Show QR Code</span>
        </button>
      </div>

      {/* 7. Footer Branding */}
      <div className="card-footer-branding">
        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>
          {card.company_name}
        </div>
        <div>
          Powered by <a href="https://raktabusiness.com" target="_blank" rel="noopener noreferrer">Rakta Business OS</a> &bull; Digital Identity Platform
        </div>
      </div>

      {/* Modals */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        cardUrl={cardUrl}
        cardName={card.full_name}
      />

      <QRModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        cardUrl={cardUrl}
        cardName={card.full_name}
        primaryColor={primaryColor}
      />

      <SendEnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        cardSlug={card.slug || card.username}
        cardName={card.full_name}
        companyName={card.company_name}
        primaryColor={primaryColor}
      />
    </div>
  );
}
