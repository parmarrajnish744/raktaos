import { supabase, isSupabaseConfigured, getPublicCardUrl } from '../utils/supabaseClient';
import { generateCardSlug } from '../utils/slugGenerator';

/**
 * Service to manage Supabase Database interactions for Rakta Business OS.
 */

// Helper to normalize card fields between frontend and Supabase DB
export function normalizeCard(card) {
  if (!card) return null;
  return {
    ...card,
    company_name: card.company_name || card.company || '',
    company: card.company || card.company_name || '',
    profile_photo: card.profile_photo || card.profile_image_url || '',
    profile_image_url: card.profile_image_url || card.profile_photo || '',
    company_logo: card.company_logo || card.company_logo_url || '',
    company_logo_url: card.company_logo_url || card.company_logo || '',
    public_url: card.slug ? getPublicCardUrl(card.slug) : (card.username ? getPublicCardUrl(card.username) : ''),
    addresses: Array.isArray(card.addresses) ? card.addresses : [],
    social_links: Array.isArray(card.social_links) ? card.social_links : [],
  };
}

/**
 * Fetch a single public card by its unique slug (e.g. AB72KQ).
 * Also checks username for backwards compatibility.
 */
export async function getPublicCardBySlug(slug) {
  if (!slug) throw new Error('Card slug is required');
  const cleanSlug = slug.trim();

  // Query Supabase by slug
  let { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('slug', cleanSlug)
    .single();

  // If not found by slug, fallback check by id or username
  if (!data) {
    const { data: altData } = await supabase
      .from('cards')
      .select('*')
      .eq('username', cleanSlug)
      .single();
    if (altData) {
      data = altData;
      error = null;
    }
  }

  if (error || !data) {
    throw new Error(error?.message || 'Digital business card not found');
  }

  if (data.is_active === false || data.status === 'inactive') {
    throw new Error('This digital business card is currently inactive or suspended');
  }

  return normalizeCard(data);
}

/**
 * Fetch all cards belonging to the logged-in user.
 */
export async function getUserCards(userId) {
  let query = supabase.from('cards').select('*').order('created_at', { ascending: false });
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('Supabase fetch cards warning:', error.message);
  }

  return (data || []).map(normalizeCard);
}

/**
 * Fetch a single card by its UUID for editing.
 */
export async function getCardById(cardId) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Card not found');
  }

  return normalizeCard(data);
}

/**
 * Create a new card in Supabase with an automatically generated non-guessable slug.
 */
export async function createCardInSupabase(cardData, userId) {
  let slug = cardData.slug;
  if (!slug) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateCardSlug(6);
      const { data: existing } = await supabase
        .from('cards')
        .select('id')
        .eq('slug', candidate)
        .single();
      if (!existing) {
        slug = candidate;
        break;
      }
    }
  }

  if (!slug) {
    slug = generateCardSlug(8);
  }

  const payload = {
    user_id: userId || 'demo-user-001',
    business_id: cardData.business_id || null,
    slug,
    full_name: cardData.full_name?.trim() || 'My Name',
    designation: cardData.designation?.trim() || '',
    company: (cardData.company_name || cardData.company || 'My Company').trim(),
    company_name: (cardData.company_name || cardData.company || 'My Company').trim(),
    phone: cardData.phone?.trim() || '',
    alternate_phone: cardData.alternate_phone?.trim() || null,
    email: cardData.email?.trim() || '',
    whatsapp: cardData.whatsapp?.trim() || cardData.phone?.trim() || null,
    website: cardData.website?.trim() || null,
    address: cardData.address?.trim() || null,
    addresses: Array.isArray(cardData.addresses) ? cardData.addresses : [],
    profile_image_url: cardData.profile_photo || cardData.profile_image_url || null,
    company_logo_url: cardData.company_logo || cardData.company_logo_url || null,
    company_description: cardData.company_description?.trim() || null,
    industry: cardData.industry?.trim() || null,
    gst_number: cardData.gst_number?.trim() || null,
    registration_number: cardData.registration_number?.trim() || null,
    tagline: cardData.tagline?.trim() || null,
    theme: cardData.theme || 'corporate-blue',
    primary_color: cardData.primary_color || '#0B2E59',
    secondary_color: cardData.secondary_color || '#2563EB',
    button_style: cardData.button_style || 'rounded',
    card_style: cardData.card_style || 'modern',
    font_family: cardData.font_family || 'Inter',
    social_links: Array.isArray(cardData.social_links) ? cardData.social_links : [],
    is_active: true,
  };

  const { data, error } = await supabase.from('cards').insert(payload);
  if (error) {
    throw new Error(error.message || 'Failed to create business card in Supabase');
  }

  const created = Array.isArray(data) ? data[0] : (data || payload);
  return normalizeCard(created);
}

/**
 * Update an existing card.
 * CRITICAL RULE: The slug is preserved!
 */
export async function updateCardInSupabase(cardId, updates) {
  const { id, user_id, slug, created_at, views_count, scans_count, downloads_count, ...safeUpdates } = updates;

  const payload = {
    ...safeUpdates,
    company: safeUpdates.company_name || safeUpdates.company,
    company_name: safeUpdates.company_name || safeUpdates.company,
    profile_image_url: safeUpdates.profile_photo || safeUpdates.profile_image_url,
    company_logo_url: safeUpdates.company_logo || safeUpdates.company_logo_url,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('cards')
    .update(payload)
    .eq('id', cardId)
    .select();

  if (error) {
    throw new Error(error.message || 'Failed to update card in Supabase');
  }

  const updated = Array.isArray(data) ? data[0] : data;
  return normalizeCard(updated || { id: cardId, ...updates });
}

/**
 * Delete a card by ID.
 */
export async function deleteCardInSupabase(cardId) {
  const { error } = await supabase.from('cards').delete().eq('id', cardId);
  if (error) {
    throw new Error(error.message || 'Failed to delete card');
  }
  return true;
}

/**
 * Track an analytics event (view, scan, vcard_download, or click channels).
 */
export async function trackCardMetric(slug, eventType, extraData = {}) {
  if (!slug || !eventType) return;
  try {
    // Attempt record_card_event RPC first
    const { error } = await supabase.rpc('record_card_event', {
      p_card_slug: slug,
      p_event_type: eventType,
      p_referrer: extraData.referrer || (typeof document !== 'undefined' ? document.referrer : null),
      p_device_type: extraData.deviceType || (/mobile|android|iphone/i.test(navigator?.userAgent || '') ? 'mobile' : 'desktop'),
      p_user_agent: extraData.userAgent || (navigator?.userAgent ? navigator.userAgent.slice(0, 150) : null)
    });

    // If new RPC is not yet applied, fallback to legacy increment_card_metric
    if (error) {
      if (['view', 'scan', 'download', 'vcard_download'].includes(eventType)) {
        const legacyType = eventType === 'vcard_download' ? 'download' : eventType;
        await supabase.rpc('increment_card_metric', {
          card_slug: slug,
          metric_type: legacyType
        });
      }
    }
  } catch (err) {
    console.warn('Metric tracking warning:', err.message);
  }
}

/**
 * Fetch detailed analytics for a card from Supabase.
 */
export async function getCardAnalytics(cardId) {
  if (!cardId) return null;

  // 1. Get base card counters
  const { data: card } = await supabase
    .from('cards')
    .select('id, slug, views_count, scans_count, downloads_count')
    .eq('id', cardId)
    .single();

  if (!card) return null;

  // 2. Query analytics_events
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('event_type, created_at, device_type')
    .eq('card_id', cardId);

  const clicks = {
    call_click: 0,
    whatsapp_click: 0,
    email_click: 0,
    website_click: 0,
    map_click: 0,
    share_click: 0,
    vcard_download: card.downloads_count || 0,
    lead_submit: 0
  };

  (events || []).forEach(ev => {
    if (ev.event_type in clicks) {
      clicks[ev.event_type] = (clicks[ev.event_type] || 0) + 1;
    }
  });

  return {
    views: card.views_count || 0,
    scans: card.scans_count || 0,
    downloads: card.downloads_count || 0,
    clicks,
    eventsCount: events?.length || 0
  };
}

/**
 * Submit a customer lead enquiry from the public digital card.
 */
export async function submitLeadEnquiry(slug, leadData) {
  if (!slug) throw new Error('Card identifier required');
  const { name, phone, email, message } = leadData;

  if (!name || !name.trim()) throw new Error('Name is required');
  if (!phone || !phone.trim()) throw new Error('Phone number is required');

  // Try RPC first
  const { data, error } = await supabase.rpc('submit_card_lead', {
    p_card_slug: slug,
    p_name: name.trim(),
    p_phone: phone.trim(),
    p_email: email ? email.trim() : null,
    p_message: message ? message.trim() : null
  });

  if (error || !data?.success) {
    // Fallback: direct insert with lookup
    const { data: card } = await supabase
      .from('cards')
      .select('id, business_id')
      .eq('slug', slug)
      .single();

    if (!card) throw new Error('Card not found to associate lead');

    const { error: insertErr } = await supabase.from('leads').insert({
      card_id: card.id,
      business_id: card.business_id,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      message: message ? message.trim() : null,
      status: 'New',
      source: 'public_card'
    });

    if (insertErr) {
      console.warn('Supabase remote leads insert failed, saving to local fallback:', insertErr.message);
      const existing = JSON.parse(localStorage.getItem('rakta_supabase_leads_fallback') || '[]');
      const fallbackLead = {
        id: 'lead-' + Date.now(),
        card_id: card?.id || null,
        business_id: card?.business_id || null,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        message: message ? message.trim() : null,
        status: 'New',
        source: 'public_card',
        created_at: new Date().toISOString()
      };
      existing.unshift(fallbackLead);
      localStorage.setItem('rakta_supabase_leads_fallback', JSON.stringify(existing));
      return { success: true, fallback: true };
    }
  }

  return { success: true };
}

/**
 * Fetch all leads for owner's cards.
 */
export async function getOwnerLeads(userId) {
  // Query all cards belonging to user
  const { data: cards } = await supabase
    .from('cards')
    .select('id, full_name, company_name, slug')
    .eq('user_id', userId);

  const cardMap = Object.fromEntries((cards || []).map(c => [c.id, c]));

  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && leads) {
      return leads.map(lead => ({
        ...lead,
        card_info: cardMap[lead.card_id] || null
      }));
    }
  } catch (err) {
    console.warn('Remote leads fetch error:', err.message);
  }

  // Graceful fallback to local leads store
  try {
    const fallbackLeads = JSON.parse(localStorage.getItem('rakta_supabase_leads_fallback') || '[]');
    return fallbackLeads.map(lead => ({
      ...lead,
      card_info: cardMap[lead.card_id] || (cards?.[0] || null)
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Update lead status (New, Contacted, Converted, Lost).
 */
export async function updateLeadStatus(leadId, status) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select();

    if (!error && data?.[0]) return data[0];
  } catch (err) {
    console.warn('Remote lead update error:', err.message);
  }

  // Update in local fallback storage
  try {
    const fallbackLeads = JSON.parse(localStorage.getItem('rakta_supabase_leads_fallback') || '[]');
    const next = fallbackLeads.map(l => l.id === leadId ? { ...l, status, updated_at: new Date().toISOString() } : l);
    localStorage.setItem('rakta_supabase_leads_fallback', JSON.stringify(next));
    return next.find(l => l.id === leadId) || { id: leadId, status };
  } catch (e) {
    return { id: leadId, status };
  }
}

/**
 * AI Business Profile Generator Client
 * Proxies through server-side /api/ai/generate-profile
 */
export async function generateAIBusinessProfile({ businessName, companyName, industry, services, keywords, ownerName, city }) {
  const name = businessName || companyName;
  const res = await fetch('/api/ai/generate-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: name,
      industry,
      services: services || keywords,
      ownerName,
      city
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate profile');
  }

  const data = await res.json();
  return data.description;
}
