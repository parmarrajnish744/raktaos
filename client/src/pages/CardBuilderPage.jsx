import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  Printer,
  Eye,
  Edit,
  Sparkles
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createCardInSupabase, updateCardInSupabase, getCardById } from '../services/cardService';
import { generateCardSlug } from '../utils/slugGenerator';
import { getPublicCardUrl } from '../utils/supabaseClient';
import Step1Personal from '../components/card-builder/Step1Personal';
import Step2Company from '../components/card-builder/Step2Company';
import Step3Address from '../components/card-builder/Step3Address';
import Step4Social from '../components/card-builder/Step4Social';
import Step5Branding from '../components/card-builder/Step5Branding';
import Step6QR from '../components/card-builder/Step6QR';
import Step7Preview from '../components/card-builder/Step7Preview';
import LivePhoneMockup from '../components/card-builder/LivePhoneMockup';
import PrintableStand from '../components/qr/PrintableStand';

export default function CardBuilderPage({ editCardId, onNavigate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [mobileTab, setMobileTab] = useState('form'); // 'form' or 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [publishedCard, setPublishedCard] = useState(null);

  // Card Form State with auto-generated non-guessable slug
  const [formData, setFormData] = useState(() => ({
    slug: generateCardSlug(6),
    username: '',
    full_name: '',
    designation: '',
    phone: '',
    alternate_phone: '',
    email: '',
    whatsapp: '',
    website: '',
    company_name: '',
    company: '',
    company_logo: '',
    company_logo_url: '',
    company_description: '',
    industry: '',
    gst_number: '',
    registration_number: '',
    tagline: '',
    theme: 'corporate-blue',
    primary_color: '#0B2E59',
    secondary_color: '#2563EB',
    button_style: 'rounded',
    card_style: 'modern',
    font_family: 'Inter',
  }));

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-default-1',
      type: 'Registered Office',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: ''
    }
  ]);

  const [socialLinks, setSocialLinks] = useState([
    { id: 'soc-1', platform: 'linkedin', url: '', is_active: 1 },
    { id: 'soc-2', platform: 'whatsapp', url: '', is_active: 1 },
    { id: 'soc-3', platform: 'twitter', url: '', is_active: 0 },
    { id: 'soc-4', platform: 'instagram', url: '', is_active: 0 },
    { id: 'soc-5', platform: 'facebook', url: '', is_active: 0 },
    { id: 'soc-6', platform: 'youtube', url: '', is_active: 0 }
  ]);

  // Load existing card if in edit mode
  useEffect(() => {
    if (editCardId) {
      async function loadCard() {
        try {
          const card = await getCardById(editCardId);
          if (card) {
            setFormData(card);
            if (card.addresses && card.addresses.length > 0) {
              setAddresses(card.addresses);
            }
            if (card.social_links && card.social_links.length > 0) {
              setSocialLinks(card.social_links);
            }
          }
        } catch (err) {
          showToast('error', 'Failed to load card for editing.');
        }
      }
      loadCard();
    }
  }, [editCardId, showToast]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const steps = [
    { num: 1, label: 'Personal' },
    { num: 2, label: 'Company' },
    { num: 3, label: 'Offices' },
    { num: 4, label: 'Socials' },
    { num: 5, label: 'Branding' },
    { num: 6, label: 'QR Code' },
    { num: 7, label: 'Publish' },
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.full_name || !formData.phone || !formData.email) {
        showToast('error', 'Please fill in Full Name, Phone, and Email before proceeding.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.company_name && !formData.company) {
        showToast('error', 'Company Name is required.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 7));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit / Publish to Supabase
  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        addresses,
        social_links: socialLinks
      };

      let result;
      if (editCardId) {
        // Update existing card in Supabase: SLUG IS PRESERVED
        result = await updateCardInSupabase(editCardId, payload);
        showToast('success', 'Digital Business Card updated successfully!');
      } else {
        // Create new card in Supabase with auto non-guessable slug
        result = await createCardInSupabase(payload, user?.id);
        showToast('success', 'Digital Business Card created and published to Supabase!');
      }

      setPublishedCard(result);
    } catch (err) {
      showToast('error', err.message || 'Failed to publish card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => onNavigate('/dashboard/cards')}
            className="btn btn-ghost btn-icon"
            title="Back to Cards"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
              {editCardId ? 'Edit Digital Business Card' : 'Create Digital Business Card'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Multi-step interactive card builder with live real-time phone preview
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setPrintModalOpen(true)}
            className="btn btn-outline btn-sm"
          >
            <Printer size={15} />
            <span>Printable Stand</span>
          </button>

          {currentStep === 7 && !publishedCard && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
            >
              <Save size={15} />
              <span>{isSubmitting ? 'Saving...' : 'Save & Publish'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="stepper-nav">
        {steps.map((st) => {
          const isActive = currentStep === st.num;
          const isCompleted = currentStep > st.num;
          return (
            <div
              key={st.num}
              onClick={() => setCurrentStep(st.num)}
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="step-indicator">
                {isCompleted ? <Check size={14} /> : st.num}
              </div>
              <span className="step-text">{st.label}</span>
            </div>
          );
        })}
      </div>

      {/* Mobile Tab Switcher (Form vs Preview) */}
      <div className="mobile-view-tabs">
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`btn ${mobileTab === 'form' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
        >
          <Edit size={14} />
          <span>Editor Form</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`btn ${mobileTab === 'preview' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
        >
          <Eye size={14} />
          <span>Live Phone Preview</span>
        </button>
      </div>

      {/* Main 2-Column Grid: Form (Left) & Phone Preview (Right) */}
      <div className="builder-layout">
        {/* Form Column */}
        <div style={{ display: mobileTab === 'form' ? 'block' : 'none' }} className="builder-form-col">
          {currentStep === 1 && (
            <Step1Personal formData={formData} onChange={handleFieldChange} />
          )}

          {currentStep === 2 && (
            <Step2Company formData={formData} onChange={handleFieldChange} />
          )}

          {currentStep === 3 && (
            <Step3Address addresses={addresses} onChange={setAddresses} />
          )}

          {currentStep === 4 && (
            <Step4Social socialLinks={socialLinks} onChange={setSocialLinks} />
          )}

          {currentStep === 5 && (
            <Step5Branding formData={formData} onChange={handleFieldChange} />
          )}

          {currentStep === 6 && (
            <Step6QR
              formData={formData}
              onChange={handleFieldChange}
              onOpenPrintModal={() => setPrintModalOpen(true)}
            />
          )}

          {currentStep === 7 && (
            <Step7Preview
              formData={formData}
              onPublish={handlePublish}
              isSubmitting={isSubmitting}
              publishedCard={publishedCard}
              onNavigate={onNavigate}
            />
          )}

          {/* Stepper Navigation Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="btn btn-outline"
            >
              <ArrowLeft size={16} />
              <span>Previous Step</span>
            </button>

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
              >
                <span>Next Step</span>
                <ArrowRight size={16} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Live Phone Mockup Column */}
        <div style={{ display: mobileTab === 'preview' ? 'block' : undefined }} className="builder-preview-col">
          <LivePhoneMockup
            card={formData}
            addresses={addresses}
            socialLinks={socialLinks}
          />
        </div>
      </div>

      <style>{`
        @media (min-width: 1081px) {
          .builder-form-col { display: block !important; }
          .builder-preview-col { display: block !important; }
        }
      `}</style>

      {/* Printable Acrylic Stand Poster Modal */}
      {printModalOpen && (
        <div className="modal-backdrop" onClick={() => setPrintModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px', padding: '1rem', backgroundColor: '#F8FAFC' }}
            onClick={(e) => e.stopPropagation()}
          >
            <PrintableStand
              card={{
                ...formData,
                public_url: getPublicCardUrl(formData.slug || 'my-card')
              }}
              onClose={() => setPrintModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
