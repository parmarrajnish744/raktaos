import React, { useState } from 'react';
import { Building, Award, FileText, Sparkles, Loader2 } from 'lucide-react';
import { generateAIBusinessProfile } from '../../services/cardService';
import { useToast } from '../../context/ToastContext';

export default function Step2Company({ formData, onChange }) {
  const [generating, setGenerating] = useState(false);
  const { addToast } = useToast();

  const handleGenerateAI = async () => {
    if (!formData.company_name?.trim()) {
      addToast('Please enter your Company Name first so the AI can craft an accurate profile.', 'warning');
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
        addToast('AI generated company profile successfully!', 'success');
      } else {
        addToast('Could not generate profile. Please try again.', 'error');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      addToast(err.message || 'Failed to contact AI service.', 'error');
    } finally {
      setGenerating(false);
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
            onChange={(e) => onChange('company_name', e.target.value)}
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

      {/* Company Logo */}
      <div className="form-group">
        <label className="form-label">Company Logo URL</label>
        <input
          type="url"
          className="form-input"
          placeholder="https://... or link to company logo image"
          value={formData.company_logo || ''}
          onChange={(e) => onChange('company_logo', e.target.value)}
        />
        <span className="form-helper">
          Transparent PNG or square SVG logo looks best on the digital card banner.
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
