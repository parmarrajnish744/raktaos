import React from 'react';
import { Palette, Check } from 'lucide-react';

export default function Step5Branding({ formData, onChange }) {
  const presetThemes = [
    { id: 'corporate-blue', name: 'Corporate Blue', primary: '#0B2E59', secondary: '#2563EB' },
    { id: 'modern-black', name: 'Modern Black', primary: '#0F172A', secondary: '#3B82F6' },
    { id: 'minimal-white', name: 'Minimal Slate', primary: '#1E293B', secondary: '#0284C7' },
    { id: 'premium-gold', name: 'Premium Gold', primary: '#1C1917', secondary: '#D97706' },
    { id: 'tech-blue', name: 'Tech Cyan', primary: '#0369A1', secondary: '#06B6D4' },
    { id: 'business-green', name: 'Business Green', primary: '#064E3B', secondary: '#10B981' }
  ];

  const handleSelectPreset = (theme) => {
    onChange('theme', theme.id);
    onChange('primary_color', theme.primary);
    onChange('secondary_color', theme.secondary);
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
          <Palette size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Step 5: Themes & Branding</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Choose curated corporate palettes or fine-tune custom brand colors and typography.
          </p>
        </div>
      </div>

      {/* Preset Themes Grid */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label className="form-label" style={{ marginBottom: '0.75rem' }}>Curated Theme Presets</label>
        <div className="themes-grid">
          {presetThemes.map((theme) => {
            const isSelected = (formData.primary_color === theme.primary && formData.secondary_color === theme.secondary) || formData.theme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectPreset(theme)}
                className={`theme-card ${isSelected ? 'selected' : ''}`}
              >
                <div
                  className="theme-color-preview"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary} 60%, ${theme.secondary} 100%)`,
                    position: 'relative'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={12} color="var(--primary)" />
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)' }}>
                  {theme.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Color Pickers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">Primary Brand Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="color"
              style={{
                width: '44px',
                height: '40px',
                padding: '2px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
              value={formData.primary_color || '#0B2E59'}
              onChange={(e) => onChange('primary_color', e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              value={formData.primary_color || '#0B2E59'}
              onChange={(e) => onChange('primary_color', e.target.value)}
            />
          </div>
          <span className="form-helper">Applied to header banner and card highlights.</span>
        </div>

        <div className="form-group">
          <label className="form-label">Secondary / Accent Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="color"
              style={{
                width: '44px',
                height: '40px',
                padding: '2px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
              value={formData.secondary_color || '#2563EB'}
              onChange={(e) => onChange('secondary_color', e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              value={formData.secondary_color || '#2563EB'}
              onChange={(e) => onChange('secondary_color', e.target.value)}
            />
          </div>
          <span className="form-helper">Applied to vCard download CTA and interactive buttons.</span>
        </div>
      </div>

      {/* Typography & Shape Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Card Font Family</label>
          <select
            className="form-select"
            value={formData.font_family || 'Inter'}
            onChange={(e) => onChange('font_family', e.target.value)}
          >
            <option value="Inter">Inter (Clean & High Readability)</option>
            <option value="Manrope">Manrope (Modern Corporate Geometric)</option>
            <option value="Poppins">Poppins (Friendly & Polished)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Button Style</label>
          <select
            className="form-select"
            value={formData.button_style || 'rounded'}
            onChange={(e) => onChange('button_style', e.target.value)}
          >
            <option value="rounded">Rounded Corners (Modern standard)</option>
            <option value="pill">Pill Shape (Fully curved)</option>
            <option value="square">Subtle Crisp Edges</option>
          </select>
        </div>
      </div>
    </div>
  );
}
