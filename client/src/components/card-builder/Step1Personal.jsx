import React from 'react';
import { User, Phone, Mail, Globe, MessageCircle } from 'lucide-react';

export default function Step1Personal({ formData, onChange }) {
  return (
    <div className="card-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
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
          <User size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Step 1: Personal Information</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Enter your personal identity and direct contact channels.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label form-label-required">Full Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Sudheer Borra"
            value={formData.full_name || ''}
            onChange={(e) => onChange('full_name', e.target.value)}
            required
          />
        </div>

        {/* Designation */}
        <div className="form-group">
          <label className="form-label form-label-required">Designation / Role</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Managing Director"
            value={formData.designation || ''}
            onChange={(e) => onChange('designation', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Profile Photo */}
      <div className="form-group">
        <label className="form-label">Profile Photo URL or Avatar</label>
        <input
          type="url"
          className="form-input"
          placeholder="https://images.unsplash.com/... or paste image link"
          value={formData.profile_photo || ''}
          onChange={(e) => onChange('profile_photo', e.target.value)}
        />
        <span className="form-helper">
          Use a square, high-quality headshot image URL.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Mobile Phone */}
        <div className="form-group">
          <label className="form-label form-label-required">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={14} /> Mobile Phone
            </span>
          </label>
          <input
            type="tel"
            className="form-input"
            placeholder="e.g. +91 98765 43210"
            value={formData.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            required
          />
        </div>

        {/* Alternate Phone */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={14} /> Alternate Phone
            </span>
          </label>
          <input
            type="tel"
            className="form-input"
            placeholder="e.g. +91 98765 43211"
            value={formData.alternate_phone || ''}
            onChange={(e) => onChange('alternate_phone', e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Email */}
        <div className="form-group">
          <label className="form-label form-label-required">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} /> Email Address
            </span>
          </label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. sudheer@company.com"
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            required
          />
        </div>

        {/* WhatsApp */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MessageCircle size={14} /> WhatsApp Number
            </span>
          </label>
          <input
            type="tel"
            className="form-input"
            placeholder="e.g. +91 98765 43210"
            value={formData.whatsapp || ''}
            onChange={(e) => onChange('whatsapp', e.target.value)}
          />
        </div>
      </div>

      {/* Website */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={14} /> Personal or Corporate Website
          </span>
        </label>
        <input
          type="url"
          className="form-input"
          placeholder="https://www.company.com"
          value={formData.website || ''}
          onChange={(e) => onChange('website', e.target.value)}
        />
      </div>
    </div>
  );
}
