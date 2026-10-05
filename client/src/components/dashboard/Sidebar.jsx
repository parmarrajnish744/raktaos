import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  QrCode,
  Inbox,
  BarChart3,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ currentPath, onNavigate, mobileOpen, onCloseMobile }) {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Cards', path: '/dashboard/cards', icon: CreditCard },
    { label: 'Create Card', path: '/dashboard/cards/create', icon: PlusCircle },
    { label: 'QR Code Studio', path: '/dashboard/qr', icon: QrCode },
    { label: 'Customer Leads', path: '/dashboard/leads', icon: Inbox },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Profile', path: '/dashboard/profile', icon: User },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  const handleLinkClick = (path) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`dashboard-sidebar ${mobileOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand" style={{ justifyContent: 'space-between' }}>
        <button
          onClick={() => handleLinkClick('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textAlign: 'left' }}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800
          }}>
            R
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>Rakta</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary)', marginLeft: '0.2rem' }}>OS</span>
          </div>
        </button>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="btn btn-ghost btn-icon mobile-menu-close"
            style={{ display: 'none' }}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-menu-close { display: inline-flex !important; }
        }
      `}</style>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => handleLinkClick(item.path)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <button
            onClick={() => handleLinkClick('/card/sudheer-borra')}
            className="sidebar-link"
            style={{ color: 'var(--secondary)', backgroundColor: 'var(--secondary-subtle)' }}
          >
            <ExternalLink size={18} />
            <span>View Demo Card</span>
          </button>
        </div>
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div className="avatar avatar-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-outline btn-sm btn-block"
          style={{ justifyContent: 'flex-start' }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
