import React, { useState } from 'react';
import { CreditCard, Menu, X, ArrowRight, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ currentPath, onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNav = (path) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="landing-header">
      <div className="container landing-nav-container">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('/')}
          className="landing-brand"
          style={{ cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.2rem',
            boxShadow: '0 2px 6px rgba(230, 57, 70, 0.25)'
          }}>
            R
          </div>
          <div>
            <span style={{ color: 'var(--primary)', letterSpacing: '-0.02em' }}>Rakta</span>
            <span style={{ color: 'var(--secondary)', marginLeft: '0.25rem' }}>OS</span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none' }} className="desktop-nav-wrap">
          <ul className="landing-nav-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <button
                  onClick={() => handleNav(link.path)}
                  className="landing-nav-link"
                  style={{
                    color: currentPath === link.path ? 'var(--primary)' : undefined,
                    fontWeight: currentPath === link.path ? 700 : 600,
                  }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <style>{`
          @media (min-width: 860px) {
            .desktop-nav-wrap { display: block !important; }
            .desktop-actions-wrap { display: flex !important; }
            .mobile-toggle-btn { display: none !important; }
          }
          @media (max-width: 859px) {
            .desktop-nav-wrap { display: none !important; }
            .desktop-actions-wrap { display: none !important; }
            .mobile-toggle-btn { display: inline-flex !important; }
          }
        `}</style>

        {/* Desktop Action Buttons */}
        <div className="desktop-actions-wrap" style={{ display: 'none', alignItems: 'center', gap: '0.875rem' }}>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleNav('/dashboard')}
                className="btn btn-primary btn-sm"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNav('/dashboard/profile')}
                className="btn btn-ghost btn-sm"
                title={user?.email}
              >
                <User size={16} />
                <span>{user?.name || 'Account'}</span>
              </button>
              <button
                onClick={logout}
                className="btn btn-outline btn-sm"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('/login')}
                className="btn btn-ghost btn-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="btn btn-primary btn-sm"
              >
                <span>Create Your Card</span>
                <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle-btn btn btn-ghost btn-icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          padding: '1.25rem 1.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {navLinks.map((link) => (
              <li key={link.path}>
                <button
                  onClick={() => handleNav(link.path)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0',
                    fontSize: '1rem',
                    fontWeight: currentPath === link.path ? 700 : 500,
                    color: currentPath === link.path ? 'var(--primary)' : 'var(--text)'
                  }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className="btn btn-primary btn-block"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="btn btn-outline btn-block"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('/login')}
                  className="btn btn-outline btn-block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="btn btn-primary btn-block"
                >
                  Create Your Card
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
