import React, { useState } from 'react';
import { X, Send, Phone, User, Mail, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitLeadEnquiry, trackCardMetric } from '../../services/cardService';
import { useToast } from '../../context/ToastContext';

export default function SendEnquiryModal({ isOpen, onClose, cardSlug, cardName, companyName, primaryColor = '#0B2E59' }) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please provide your name and mobile phone number.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitLeadEnquiry(cardSlug, {
        name,
        phone,
        email,
        message
      });

      trackCardMetric(cardSlug, 'lead_submit');
      setSubmitted(true);
      showToast('success', 'Your enquiry has been sent successfully!');
    } catch (err) {
      setError(err.message || 'Failed to submit enquiry. Please try again.');
      showToast('error', err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleResetAndClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              backgroundColor: 'rgba(11, 46, 89, 0.08)',
              color: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                Send Enquiry
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Directly message {cardName || companyName}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close Enquiry Modal"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <CheckCircle2 size={52} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
              Enquiry Sent Successfully!
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Thank you, <strong>{name}</strong>. Your contact request and message have been routed to <strong>{cardName || companyName}</strong>. They will get back to you shortly.
            </p>
            <button
              onClick={handleResetAndClose}
              className="btn btn-primary btn-block"
              style={{ backgroundColor: primaryColor }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--danger-light)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8125rem',
                  marginBottom: '1rem'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label form-label-required">Your Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Kumar"
                    style={{ paddingLeft: '2.4rem' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Mobile Phone / WhatsApp</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    style={{ paddingLeft: '2.4rem' }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@email.com"
                    style={{ paddingLeft: '2.4rem' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Requirements / Message</label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Tell us what product, service, or quotation you are inquiring about..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: primaryColor }}
                id="btn-submit-enquiry"
              >
                <Send size={14} />
                <span>{submitting ? 'Submitting...' : 'Send Enquiry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
