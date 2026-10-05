import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Phone,
  MessageCircle,
  Mail,
  Search,
  CheckCircle,
  Clock,
  User,
  Filter,
  CreditCard,
  ExternalLink,
  ChevronDown,
  Download,
  Trash2
} from 'lucide-react';
import { getOwnerLeads, updateLeadStatus, deleteLead } from '../services/cardService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LeadsPage({ onNavigate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleExportCSV = () => {
    if (leads.length === 0) {
      showToast('info', 'No leads available to export.');
      return;
    }

    const headers = ['Date', 'Name', 'Phone', 'Email', 'Status', 'Card / Business', 'Source', 'Message'];
    const rows = leads.map(l => [
      l.created_at ? new Date(l.created_at).toLocaleString() : '',
      l.name || '',
      l.phone || '',
      l.email || '',
      l.status || 'New',
      l.card_info?.full_name ? `${l.card_info.full_name} (${l.card_info.company_name || ''})` : (l.card_id || 'Direct'),
      l.source || 'public_card',
      (l.message || '').replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rakta-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', `Exported ${leads.length} leads to CSV.`);
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;
    try {
      await deleteLead(leadId);
      showToast('success', 'Lead deleted successfully.');
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (err) {
      showToast('error', err.message || 'Failed to delete lead.');
    }
  };

  const fetchLeads = async () => {
    try {
      const data = await getOwnerLeads(user?.id);
      setLeads(data || []);
    } catch (err) {
      showToast('error', 'Failed to fetch customer leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user?.id]);

  const handleStatusChange = async (leadId, nextStatus) => {
    try {
      await updateLeadStatus(leadId, nextStatus);
      showToast('success', `Lead status updated to ${nextStatus}`);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: nextStatus } : l));
    } catch (err) {
      showToast('error', 'Failed to update lead status');
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesStatus = statusFilter === 'ALL' || l.status?.toLowerCase() === statusFilter.toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch =
      (l.name || '').toLowerCase().includes(query) ||
      (l.phone || '').toLowerCase().includes(query) ||
      (l.email || '').toLowerCase().includes(query) ||
      (l.message || '').toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const contactedLeads = leads.filter(l => l.status === 'Contacted').length;
  const convertedLeads = leads.filter(l => l.status === 'Converted').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <span className="badge badge-warning">New</span>;
      case 'Contacted':
        return <span className="badge badge-primary">Contacted</span>;
      case 'Converted':
        return <span className="badge badge-success">Converted</span>;
      case 'Lost':
        return <span className="badge badge-neutral">Lost</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <Inbox size={26} color="var(--primary)" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
              Customer Enquiries & Leads
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            High-intent customer messages and contact enquiries captured from your digital business cards.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={leads.length === 0}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          id="btn-export-leads-csv"
          title="Download all leads as a CSV spreadsheet"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Metrics Counters */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <Inbox size={22} />
          </div>
          <div>
            <div className="metric-val">{totalLeads}</div>
            <div className="metric-label">Total Leads</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--warning-light)', color: '#B45309' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="metric-val">{newLeads}</div>
            <div className="metric-label">New Enquiries</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <Phone size={22} />
          </div>
          <div>
            <div className="metric-val">{contactedLeads}</div>
            <div className="metric-label">Contacted</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-dark)' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="metric-val">{convertedLeads}</div>
            <div className="metric-label">Converted</div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="card-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'New', 'Contacted', 'Converted', 'Lost'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
              >
                {st === 'ALL' ? 'All Leads' : st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search leads by name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading customer enquiries...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Inbox size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No Leads Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            {search || statusFilter !== 'ALL'
              ? 'No customer enquiries match your current filters.'
              : 'When visitors tap "Send Enquiry" on your public digital card, their details and messages will appear right here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredLeads.map(lead => {
            const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
            const waGreeting = encodeURIComponent(`Hi ${lead.name}, thank you for your enquiry on our digital business card. How can we assist you today?`);
            const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waGreeting}` : '';

            return (
              <div key={lead.id} className="card-panel" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem'
                    }}>
                      {(lead.name || 'P').charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                          {lead.name}
                        </h4>
                        {getStatusBadge(lead.status)}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Received on {new Date(lead.created_at).toLocaleDateString()} at {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Status Picker & Direct Communication Quick Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="btn btn-outline btn-sm"
                        title="Call Prospect"
                      >
                        <Phone size={14} color="var(--success)" />
                        <span>Call</span>
                      </a>
                    )}

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#059669', borderColor: '#A7F3D0' }}
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}?subject=Response to your enquiry`}
                        className="btn btn-outline btn-sm"
                        title="Send Email"
                      >
                        <Mail size={14} color="var(--secondary)" />
                      </a>
                    )}

                    <select
                      className="form-select"
                      style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8125rem', fontWeight: 600 }}
                      value={lead.status || 'New'}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    >
                      <option value="New">Mark: New</option>
                      <option value="Contacted">Mark: Contacted</option>
                      <option value="Converted">Mark: Converted</option>
                      <option value="Lost">Mark: Lost</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteLead(lead.id)}
                      className="btn btn-outline btn-sm btn-icon"
                      style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
                      title="Delete Lead"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Lead Message Body */}
                {lead.message && (
                  <div style={{
                    backgroundColor: 'var(--surface-alt)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    border: '1px solid var(--border-light)',
                    marginTop: '0.5rem'
                  }}>
                    "{lead.message}"
                  </div>
                )}

                {/* Footer details */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span>Phone: <strong>{lead.phone}</strong></span>
                    {lead.email && <span style={{ marginLeft: '1rem' }}>Email: <strong>{lead.email}</strong></span>}
                  </div>
                  {lead.card_info && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CreditCard size={12} />
                      <span>Card: {lead.card_info.company_name} ({lead.card_info.full_name})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
