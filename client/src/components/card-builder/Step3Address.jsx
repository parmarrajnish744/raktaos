import React from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';

export default function Step3Address({ addresses = [], onChange }) {
  const handleAddOffice = () => {
    const defaultType = addresses.length === 0 ? 'Registered Office' : (addresses.length === 1 ? 'Factory Office' : 'Branch Office');
    const newOffice = {
      id: Date.now().toString(36),
      type: defaultType,
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: ''
    };
    onChange([...addresses, newOffice]);
  };

  const handleRemoveOffice = (index) => {
    const updated = addresses.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = addresses.map((addr, idx) => {
      if (idx === index) {
        return { ...addr, [field]: value };
      }
      return addr;
    });
    onChange(updated);
  };

  return (
    <div className="card-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <MapPin size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Step 3: Office & Factory Locations</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Add multiple offices dynamically. "View on Map" directions are automatically generated for each address.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddOffice}
          className="btn btn-secondary btn-sm"
        >
          <Plus size={16} />
          <span>Add Office</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          backgroundColor: 'var(--surface-alt)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border)'
        }}>
          <MapPin size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Office Locations Added Yet</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Add your Registered Office, Factory Office, or Branch Locations so customers can navigate to you.
          </p>
          <button
            type="button"
            onClick={handleAddOffice}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>Add Registered Office</span>
          </button>
        </div>
      ) : (
        addresses.map((office, idx) => (
          <div key={office.id || idx} className="dynamic-row-card">
            <div className="dynamic-row-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-primary">Location #{idx + 1}</span>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: 'auto', minWidth: '180px', padding: '0.35rem 0.6rem', fontSize: '0.875rem', fontWeight: 700 }}
                  value={office.type}
                  placeholder="e.g. Registered Office / Factory Office"
                  onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveOffice(idx)}
                className="btn btn-ghost btn-icon"
                style={{ color: 'var(--danger)' }}
                title="Remove Office"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Street Address */}
            <div className="form-group">
              <label className="form-label">Street / Area Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Plot No. 42, Phase-II, Industrial Development Area, Cherlapally"
                value={office.address || ''}
                onChange={(e) => handleFieldChange(idx, 'address', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* City */}
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hyderabad"
                  value={office.city || ''}
                  onChange={(e) => handleFieldChange(idx, 'city', e.target.value)}
                />
              </div>

              {/* State */}
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Telangana"
                  value={office.state || ''}
                  onChange={(e) => handleFieldChange(idx, 'state', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Pincode */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pincode / Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 500051"
                  value={office.pincode || ''}
                  onChange={(e) => handleFieldChange(idx, 'pincode', e.target.value)}
                />
              </div>

              {/* Country */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. India"
                  value={office.country || 'India'}
                  onChange={(e) => handleFieldChange(idx, 'country', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
