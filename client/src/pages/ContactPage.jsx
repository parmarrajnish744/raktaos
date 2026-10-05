import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ContactPage() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('success', 'Your message has been sent successfully. We will respond within 24 hours!');
  };

  return (
    <div style={{ flex: 1, padding: '4rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div className="text-center" style={{ marginBottom: '3.5rem' }}>
          <span className="section-tag">Get In Touch</span>
          <h1 className="section-heading" style={{ fontSize: '2.75rem' }}>
            We'd Love to Hear From You
          </h1>
          <p className="section-desc">
            Have questions about enterprise deployment, custom QR card stands, or feature requests? Contact our team.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
          {/* Form */}
          <div className="card-panel">
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Message Dispatched!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Thank you for reaching out. Our enterprise support team will review your inquiry and follow up shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="btn btn-outline"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label form-label-required">Your Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sudheer Borra"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Your Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. sudheer@company.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Enterprise Team Licensing Inquiry"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Message</label>
                  <textarea
                    rows={5}
                    className="form-textarea"
                    placeholder="How can we assist your business?"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card-panel">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>
                Corporate Contact
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={18} color="var(--primary)" />
                  <span>support@raktabusiness.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={18} color="var(--primary)" />
                  <span>+91 98490 12345</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Rakta Business OS India<br />Financial District & HiTech City<br />Hyderabad, Telangana 500081, India</span>
                </div>
              </div>
            </div>

            <div className="card-panel" style={{ backgroundColor: 'var(--primary-subtle)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Immediate Demo Support
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Want to see the reference card for RUSHI Power Systems? Click "View Demo" anytime to test live QR scanning and vCard download on your phone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
