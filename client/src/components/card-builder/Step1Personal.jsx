import React, { useState } from 'react';
import { User, Phone, Mail, Globe, MessageCircle, Upload, X, Loader2 } from 'lucide-react';
import { uploadCardAsset } from '../../services/cardService';
import { useToast } from '../../context/ToastContext';

export default function Step1Personal({ formData, onChange, userId }) {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userId) {
      showToast('error', 'Please sign in to upload media.');
      return;
    }

    setIsUploading(true);
    try {
      const { publicUrl } = await uploadCardAsset(file, userId, 'avatars');
      onChange('profile_photo', publicUrl);
      onChange('profile_image_url', publicUrl);
      showToast('success', 'Profile photo uploaded successfully!');
    } catch (err) {
      showToast('error', err.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

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

      {/* Profile Photo with Supabase Storage File Upload */}
      <div className="form-group">
        <label className="form-label">Profile Photo (Cloud Storage Upload or URL)</label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          {formData.profile_photo ? (
            <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--primary)', flexShrink: 0 }}>
              <img
                src={formData.profile_photo}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => {
                  onChange('profile_photo', '');
                  onChange('profile_image_url', '');
                }}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              backgroundColor: 'var(--surface-alt)',
              border: '2px dashed var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              flexShrink: 0
            }}>
              <User size={24} />
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label
                className="btn btn-outline btn-sm"
                style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {isUploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
              </label>

              {formData.profile_photo && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('profile_photo', '');
                    onChange('profile_image_url', '');
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger)' }}
                >
                  Clear
                </button>
              )}
            </div>

            <input
              type="url"
              className="form-input"
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
              placeholder="Or paste an external image link"
              value={formData.profile_photo || ''}
              onChange={(e) => {
                onChange('profile_photo', e.target.value);
                onChange('profile_image_url', e.target.value);
              }}
            />
          </div>
        </div>
        <span className="form-helper">
          Upload a square headshot (JPG, PNG, WEBP, max 5MB) securely to Supabase Storage.
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
          <label className="form-label">Alternate Phone / Landline</label>
          <input
            type="tel"
            className="form-input"
            placeholder="e.g. 040 2345 6789"
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
          <span className="form-helper">
            Leave blank to use primary mobile phone for WhatsApp click-to-chat.
          </span>
        </div>
      </div>

      {/* Website */}
      <div className="form-group">
        <label className="form-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={14} /> Website / Portfolio URL
          </span>
        </label>
        <input
          type="url"
          className="form-input"
          placeholder="https://www.yourcompany.com"
          value={formData.website || ''}
          onChange={(e) => onChange('website', e.target.value)}
        />
      </div>
    </div>
  );
}
