import React, { useState } from 'react';
import { CreditCard, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage({ onNavigate }) {
  const { login, resendVerification } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUnconfirmedEmail('');
    try {
      await login(email, password);
      showToast('success', 'Logged in successfully!');
      onNavigate('/dashboard');
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setUnconfirmedEmail(email);
        showToast('error', 'Your email address is not verified yet. Please check your inbox or resend the verification link.');
      } else {
        showToast('error', msg || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unconfirmedEmail) return;
    setResending(true);
    try {
      await resendVerification(unconfirmedEmail);
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
      <div className="card-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
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
            Rakta <span style={{ color: 'var(--secondary)' }}>Business OS</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Sign in to manage your digital cards, leads, and analytics
          </p>
        </div>

        {unconfirmedEmail && (
          <div style={{
            backgroundColor: 'var(--warning-light)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
            color: '#92400E'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Email Verification Required</strong>
                <p style={{ margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                  Your account has been created, but your email has not been verified yet. Check your inbox or request a new verification email below.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', borderColor: '#D97706', color: '#92400E', fontWeight: 700, backgroundColor: '#FFFFFF', marginTop: '0.5rem' }}
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label-required">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label form-label-required">Password</label>
              <button
                type="button"
                style={{ fontSize: '0.75rem', color: 'var(--secondary)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                onClick={() => onNavigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '1.25rem' }}
            id="btn-login-submit"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('/register')}
            style={{ color: 'var(--secondary)', fontWeight: 700 }}
          >
            Create one free
          </button>
        </div>
      </div>
    </div>
  );
}
