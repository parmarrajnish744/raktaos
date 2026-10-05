import React, { useState, useEffect } from 'react';
import { Menu, Plus, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOwnerLeads } from '../../services/cardService';

export default function Topbar({ title, onOpenMobile, onNavigate }) {
  const { user } = useAuth();
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  useEffect(() => {
    async function checkLeads() {
      try {
        const leads = await getOwnerLeads(user?.id);
        const newCount = (leads || []).filter(l => l.status === 'New').length;
        setNewLeadsCount(newCount);
      } catch (e) {
        // quiet fallback
      }
    }
    if (user?.id) {
      checkLeads();
      const interval = setInterval(checkLeads, 15000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button
          onClick={onOpenMobile}
          className="mobile-menu-btn"
          aria-label="Open Navigation"
        >
          <Menu size={22} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
          {title || 'Dashboard'}
        </h1>
      </div>

      <div className="topbar-right">
        {/* Leads Notification Button */}
        <button
          onClick={() => onNavigate('/dashboard/leads')}
          className="btn btn-ghost btn-icon"
          style={{ position: 'relative' }}
          title={newLeadsCount > 0 ? `${newLeadsCount} new lead enquiries` : 'Customer Leads'}
        >
          <Inbox size={19} />
          {newLeadsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: '#E63946',
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 800,
              borderRadius: '9999px',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 4px rgba(230, 57, 70, 0.4)'
            }}>
              {newLeadsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate('/dashboard/cards/create')}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} />
          <span>Create Card</span>
        </button>

        <button
          onClick={() => onNavigate('/dashboard/profile')}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <div className="avatar avatar-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span style={{ fontWeight: 600, display: 'none' }} className="topbar-user-name">
            {user?.name?.split(' ')[0]}
          </span>
        </button>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .topbar-user-name { display: inline !important; }
        }
      `}</style>
    </header>
  );
}
