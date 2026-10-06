import React, { useState } from 'react';
import { CreditCard, Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage({ onNavigate }) {
  const { register, resendVerification } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res && res.session) {
        showToast('success', 'Account registered successfully! Welcome to Rakta Business OS.');
        onNavigate('/dashboard/cards/create');
      } else {
        setSubmittedEmail(email);
        showToast('success', 'Account created! Please check your email to activate your account.');
      }
    } catch (err) {
      showToast('error', err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;
    setResending(true);
    try {
      await resendVerification(submittedEmail);
      showToast('success', 'Verification email resent! Please check your inbox and spam folder.');
    } catch (err) {
      showToast('error', err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: 'var(--bg)'
    }}>
      <div className="card-panel" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem 2rem' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontWeight: 800,
            fontSize: '1.4rem',
            boxShadow: '0 4px 10px rgba(230, 57, 70, 0.25)'
          }}>
            R
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
            {submittedEmail ? 'Check Your ' : 'Get Started with '}
            <span style={{ color: 'var(--secondary)' }}>{submittedEmail ? 'Inbox' : 'Rakta OS'}</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {submittedEmail
              ? 'Verify your email to activate your business card and portal'
              : 'Transform your business identity and start capturing high-intent leads'}
          </p>
        </div>

        {submittedEmail ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: '#D1FAE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Mail size={20} color="#059669" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                    Confirmation Email Dispatched
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Powered by Resend SMTP
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                We sent a secure activation link to <strong style={{ color: 'var(--text)' }}>{submittedEmail}</strong>.
                Click the link in the message to activate your account and start creating your digital card.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={resending}
                onClick={handleResend}
                className="btn btn-outline btn-block"
                id="btn-register-resend"
              >
                <span>{resending ? 'Sending Email...' : 'Resend Verification Email'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="btn btn-primary btn-block"
                id="btn-register-to-login"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
              Didn't receive the email? Check your spam/junk folder or click Resend above.
            </p>
          </div>
        ) : (
          <>
            {/* Benefits bar */}
            <div style={{
              backgroundColor: 'var(--surface-alt)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={14} color="var(--success)" />
                <span>Instant unique card URL & dynamic QR Code</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={14} color="var(--success)" />
                <span>RFC-compliant vCard contact downloads</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label form-label-required">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Sudheer Borra"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Work Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="sudheer@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Minimum 6 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <span className="form-helper">At least 6 characters</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block btn-lg"
                style={{ marginTop: '1.25rem' }}
                id="btn-register-submit"
              >
                <span>{loading ? 'Creating account...' : 'Create Account & Card'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('/login')}
                style={{ color: 'var(--secondary)', fontWeight: 700 }}
              >
                Sign in here
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
