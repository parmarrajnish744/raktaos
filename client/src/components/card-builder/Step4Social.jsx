import { Share2 } from 'lucide-react';
import { SocialIcon } from '../common/SocialIcons';

export default function Step4Social({ socialLinks = [], onChange }) {
  const platforms = [
    { key: 'linkedin', name: 'LinkedIn', color: '#0A66C2', placeholder: 'https://linkedin.com/in/username' },
    { key: 'whatsapp', name: 'WhatsApp Link', color: '#25D366', placeholder: 'https://wa.me/919876543210' },
    { key: 'twitter', name: 'Twitter / X', color: '#111827', placeholder: 'https://x.com/username' },
    { key: 'instagram', name: 'Instagram', color: '#E4405F', placeholder: 'https://instagram.com/username' },
    { key: 'facebook', name: 'Facebook', color: '#1877F2', placeholder: 'https://facebook.com/username' },
    { key: 'youtube', name: 'YouTube', color: '#FF0000', placeholder: 'https://youtube.com/@channel' },
    { key: 'telegram', name: 'Telegram', color: '#0088CC', placeholder: 'https://t.me/username' },
  ];

  const handleToggle = (platformKey) => {
    const existing = socialLinks.find((s) => s.platform === platformKey);
    if (existing) {
      const updated = socialLinks.map((s) => {
        if (s.platform === platformKey) {
          return { ...s, is_active: s.is_active ? 0 : 1 };
        }
        return s;
      });
      onChange(updated);
    } else {
      onChange([
        ...socialLinks,
        {
          id: Date.now().toString(36),
          platform: platformKey,
          url: '',
          is_active: 1
        }
      ]);
    }
  };

  const handleUrlChange = (platformKey, url) => {
    const existing = socialLinks.find((s) => s.platform === platformKey);
    if (existing) {
      const updated = socialLinks.map((s) => {
        if (s.platform === platformKey) {
          return { ...s, url };
        }
        return s;
      });
      onChange(updated);
    } else {
      onChange([
        ...socialLinks,
        {
          id: Date.now().toString(36),
          platform: platformKey,
          url,
          is_active: 1
        }
      ]);
    }
  };

  return (
    <div className="card-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
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
          <Share2 size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Step 4: Social Media Links</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Connect your professional and business social profiles. Enable or disable individual channels.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {platforms.map((p) => {
          const currentLink = socialLinks.find((s) => s.platform === p.key);
          const isEnabled = currentLink ? !!currentLink.is_active : false;
          const currentUrl = currentLink ? currentLink.url : '';

          return (
            <div
              key={p.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem 1rem',
                backgroundColor: isEnabled ? 'var(--surface)' : 'var(--surface-alt)',
                border: `1px solid ${isEnabled ? 'var(--border-strong)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Icon & Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '150px' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: `${p.color}15`,
                  color: p.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <SocialIcon platform={p.key} size={18} color={p.color} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isEnabled ? 'var(--text)' : 'var(--text-muted)' }}>
                  {p.name}
                </span>
              </div>

              {/* URL Input */}
              <div style={{ flex: 1 }}>
                <input
                  type="url"
                  className="form-input"
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.875rem',
                    backgroundColor: isEnabled ? '#FFFFFF' : 'var(--surface-alt)',
                    opacity: isEnabled ? 1 : 0.6
                  }}
                  placeholder={p.placeholder}
                  value={currentUrl}
                  disabled={!isEnabled}
                  onChange={(e) => handleUrlChange(p.key, e.target.value)}
                />
              </div>

              {/* Toggle switch */}
              <label className="switch" style={{ flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => handleToggle(p.key)}
                />
                <span className="switch-slider" />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
