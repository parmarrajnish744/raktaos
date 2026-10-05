import React, { useState } from 'react';
import {
  Building,
  Award,
  FileText,
  Sparkles,
  Loader2,
  Upload,
  X,
  Briefcase,
  Plus,
  Trash2
} from 'lucide-react';
import { generateAIBusinessProfile, uploadCardAsset } from '../../services/cardService';
import { useToast } from '../../context/ToastContext';

export default function Step2Company({ formData, onChange, userId }) {
  const [generating, setGenerating] = useState(false);
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
      const { publicUrl } = await uploadCardAsset(file, userId, 'logos');
      onChange('company_logo', publicUrl);
      onChange('company_logo_url', publicUrl);
      showToast('success', 'Company logo uploaded successfully!');
    } catch (err) {
      showToast('error', err.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.company_name?.trim()) {
      showToast('warning', 'Please enter your Company Name first so the AI can craft an accurate profile.');
      return;
    }

    try {
      setGenerating(true);
      const description = await generateAIBusinessProfile({
        companyName: formData.company_name,
        industry: formData.industry || '',
        ownerName: formData.full_name || '',
        services: [formData.tagline, formData.industry].filter(Boolean)
      });

      if (description) {
        onChange('company_description', description);
        showToast('success', 'AI generated company profile successfully!');
      } else {
        showToast('error', 'Could not generate profile. Please try again.');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      showToast('error', err.message || 'Failed to contact AI service.');
    } finally {
      setGenerating(false);
    }
  };

  // Services management
  const services = Array.isArray(formData.services) ? formData.services : [];

  const handleAddService = () => {
    const next = [...services, { title: '', description: '', price: '' }];
    onChange('services', next);
  };

  const handleServiceChange = (index, field, value) => {
    const next = [...services];
    next[index] = { ...next[index], [field]: value };
    onChange('services', next);
  };

  const handleRemoveService = (index) => {
    const next = services.filter((_, idx) => idx !== index);
    onChange('services', next);
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
          <Building size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Step 2: Company Information</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Enter your business organization details, branding, and registration numbers.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Company Name */}
        <div className="form-group">
          <label className="form-label form-label-required">Company / Business Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. RUSHI Power Systems Pvt. Ltd."
            value={formData.company_name || ''}
            onChange={(e) => {
              onChange('company_name', e.target.value);
              onChange('company', e.target.value);
            }}
            required
          />
        </div>

        {/* Tagline / ISO */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Award size={14} /> Tagline / Subtitle
            </span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. ISO 9001:2015 Certified Power Solutions"
            value={formData.tagline || ''}
            onChange={(e) => onChange('tagline', e.target.value)}
          />
        </div>
      </div>

      {/* Company Logo with Supabase Storage Upload */}
      <div className="form-group">
        <label className="form-label">Company Logo (Cloud Storage Upload or URL)</label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          {formData.company_logo ? (
            <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--primary)', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img
                src={formData.company_logo}
                alt="Logo"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
              <button
                type="button"
                onClick={() => {
                  onChange('company_logo', '');
                  onChange('company_logo_url', '');
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
                title="Remove logo"
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
              <Building size={24} />
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label
                className="btn btn-outline btn-sm"
                style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {isUploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                <span>{isUploading ? 'Uploading...' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
              </label>

              {formData.company_logo && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('company_logo', '');
                    onChange('company_logo_url', '');
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
              placeholder="Or paste an external logo URL"
              value={formData.company_logo || ''}
              onChange={(e) => {
                onChange('company_logo', e.target.value);
                onChange('company_logo_url', e.target.value);
              }}
            />
          </div>
        </div>
        <span className="form-helper">
          Transparent PNG or vector SVG logo looks best on the digital card banner.
        </span>
      </div>

      {/* Industry */}
      <div className="form-group">
        <label className="form-label">Industry / Sector</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Electrical & Energy Engineering"
          value={formData.industry || ''}
          onChange={(e) => onChange('industry', e.target.value)}
        />
      </div>

      {/* Company Description with AI Assist */}
      <div className="form-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Company Description / Overview</label>
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={generating}
            className="btn btn-sm"
            style={{
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.1) 0%, rgba(69, 123, 157, 0.15) 100%)',
              color: 'var(--primary)',
              border: '1px solid rgba(230, 57, 70, 0.25)',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 600,
              cursor: generating ? 'not-allowed' : 'pointer'
            }}
          >
            {generating ? (
              <>
                <Loader2 size={12} className="spin" />
                <span>Crafting with AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={12} />
                <span>Generate with AI</span>
              </>
            )}
          </button>
        </div>
        <textarea
          rows={3}
          className="form-textarea"
          placeholder="Brief description of what your business does..."
          value={formData.company_description || ''}
          onChange={(e) => onChange('company_description', e.target.value)}
        />
      </div>

      {/* Business Services & Offerings (Phase I) */}
      <div style={{
        backgroundColor: 'var(--surface-alt)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={16} color="var(--primary)" />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Key Products & Services</h4>
          </div>
          <button
            type="button"
            onClick={handleAddService}
            className="btn btn-outline btn-sm"
          >
            <Plus size={14} />
            <span>Add Service</span>
          </button>
        </div>

        {services.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
            No specific services added yet. Click &quot;Add Service&quot; to showcase your core offerings and pricing directly on your card.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {services.map((srv, idx) => (
              <div key={idx} style={{
                backgroundColor: 'var(--bg-card)',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Service title (e.g. Turnkey Industrial Substation)"
                    value={srv.title || ''}
                    onChange={(e) => handleServiceChange(idx, 'title', e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Price (optional, e.g. ₹25,000 / Quote)"
                    value={srv.price || ''}
                    onChange={(e) => handleServiceChange(idx, 'price', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="btn btn-ghost btn-sm btn-icon"
                    style={{ color: 'var(--danger)' }}
                    title="Remove service"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Short description of this service offering..."
                  value={srv.description || ''}
                  onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                  style={{ fontSize: '0.8125rem' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* GST Number */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={14} /> GST Number
            </span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 36AABCR1234F1Z8"
            value={formData.gst_number || ''}
            onChange={(e) => onChange('gst_number', e.target.value)}
          />
        </div>

        {/* Registration Number / CIN */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={14} /> Registration / CIN No.
            </span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. U40100TG2008PTC059123"
            value={formData.registration_number || ''}
            onChange={(e) => onChange('registration_number', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
