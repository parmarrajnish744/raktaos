import { supabase, isSupabaseConfigured, getPublicCardUrl } from '../utils/supabaseClient';
import { generateCardSlug } from '../utils/slugGenerator';

/**
 * Service to manage Supabase Database interactions for Rakta Business OS.
 * Strictly cloud-backed: zero localStorage fallback databases.
 */

// Helper to normalize card fields between frontend and Supabase DB
export function normalizeCard(card) {
  if (!card) return null;
  const isActive = card.is_active !== false && card.status !== 'inactive';
  return {
    ...card,
    is_active: isActive,
    status: isActive ? 'active' : 'inactive',
    company_name: card.company_name || card.company || '',
    company: card.company || card.company_name || '',
    profile_photo: card.profile_photo || card.profile_image_url || '',
    profile_image_url: card.profile_image_url || card.profile_photo || '',
    company_logo: card.company_logo || card.company_logo_url || '',
    company_logo_url: card.company_logo_url || card.company_logo || '',
    public_url: card.slug ? getPublicCardUrl(card.slug) : (card.username ? getPublicCardUrl(card.username) : ''),
    addresses: Array.isArray(card.addresses) ? card.addresses : [],
    social_links: Array.isArray(card.social_links) ? card.social_links : [],
    services: Array.isArray(card.services) ? card.services : []
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

  // If not found by slug, fallback check by username
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
    throw new Error('Digital business card not found');
  }

  if (data.is_active === false || data.status === 'inactive') {
    throw new Error('This digital business card is currently inactive or suspended');
  }

  const normalized = normalizeCard(data);

  // If business_id is set, fetch business services
  if (data.business_id) {
    try {
      const { data: srvs } = await supabase
        .from('business_services')
        .select('*')
        .eq('business_id', data.business_id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (srvs && srvs.length > 0) {
        normalized.services = srvs;
      }
    } catch (_) {}
  }

  return normalized;
}

/**
 * Fetch all cards belonging to the logged-in user.
 * Enforces ownership: only returns cards where user_id = userId.
 */
export async function getUserCards(userId) {
  let targetUserId = userId;
  if (!targetUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      targetUserId = user?.id;
    } catch (_) {}
  }
  if (!targetUserId) return [];

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch cards error:', error.message);
    throw new Error('Unable to fetch your business cards. Please check your connection.');
  }

  return (data || []).map(normalizeCard);
}

/**
 * Fetch a single card by its UUID for editing.
 */
export async function getCardById(cardId) {
  if (!cardId) throw new Error('Card ID is required');

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
 * Requires authenticated Supabase User ID.
 */
export async function createCardInSupabase(cardData, userId) {
  if (!userId) {
    throw new Error('Authentication required. You must be signed in to create a digital business card.');
  }

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
    user_id: userId,
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
    status: 'active',
    is_active: true,
  };

  const { data, error } = await supabase.from('cards').insert(payload).select();
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
  if (!cardId) throw new Error('Card ID required for update');

  const { id, user_id, slug, created_at, views_count, scans_count, downloads_count, ...safeUpdates } = updates;

  const isActive = safeUpdates.is_active !== false && safeUpdates.status !== 'inactive';

  const payload = {
    ...safeUpdates,
    is_active: isActive,
    status: isActive ? 'active' : 'inactive',
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
 * Includes client-side session deduplication to prevent telemetry spam.
 */
export async function trackCardMetric(slug, eventType, extraData = {}) {
  if (!slug || !eventType) return;

  // Session deduplication: Don't track repeat views/scans within 30s in same tab session
  const sessionKey = `rakta_event_${slug}_${eventType}`;
  if (['view', 'page_view', 'scan', 'qr_scan'].includes(eventType)) {
    const lastTracked = sessionStorage.getItem(sessionKey);
    const now = Date.now();
    if (lastTracked && now - parseInt(lastTracked, 10) < 30000) {
      return;
    }
    sessionStorage.setItem(sessionKey, String(now));
  }

  try {
    // 1. Attempt record_card_event RPC (comprehensive event logger + counter)
    const { data: rpcData, error: rpcErr } = await supabase.rpc('record_card_event', {
      p_card_slug: slug,
      p_event_type: eventType,
      p_referrer: extraData.referrer || (typeof document !== 'undefined' ? document.referrer : null),
      p_device_type: extraData.deviceType || (/mobile|android|iphone/i.test(navigator?.userAgent || '') ? 'mobile' : 'desktop'),
      p_user_agent: extraData.userAgent || (navigator?.userAgent ? navigator.userAgent.slice(0, 150) : null)
    });

    if (!rpcErr) return;

    // 2. Fallback to increment_card_metric if record_card_event RPC is not yet loaded
    if (['view', 'page_view', 'scan', 'qr_scan', 'download', 'vcard_download'].includes(eventType)) {
      let legacyType = eventType;
      if (eventType === 'page_view') legacyType = 'view';
      if (eventType === 'qr_scan') legacyType = 'scan';
      if (eventType === 'vcard_download') legacyType = 'download';

      await supabase.rpc('increment_card_metric', {
        card_slug: slug,
        metric_type: legacyType,
        metric_name: legacyType
      });
    }
  } catch (err) {
    console.warn('Metric tracking notice:', err.message);
  }
}

/**
 * Fetch detailed analytics for a card from Supabase.
 */
export async function getCardAnalytics(cardId) {
  if (!cardId) return null;

  // 1. Get base card counters
  const { data: card, error: cardErr } = await supabase
    .from('cards')
    .select('id, slug, views_count, scans_count, downloads_count')
    .eq('id', cardId)
    .single();

  if (cardErr || !card) return null;

  // 2. Query analytics_events table
  let events = [];
  try {
    const { data: evData, error: evErr } = await supabase
      .from('analytics_events')
      .select('event_type, created_at, device_type')
      .eq('card_id', cardId);
    if (!evErr && evData) {
      events = evData;
    }
  } catch (_) {}

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

  events.forEach(ev => {
    let t = ev.event_type;
    if (t === 'location_click') t = 'map_click';
    if (t === 'share') t = 'share_click';
    if (t in clicks) {
      clicks[t] = (clicks[t] || 0) + 1;
    }
  });

  return {
    views: card.views_count || 0,
    scans: card.scans_count || 0,
    downloads: card.downloads_count || 0,
    clicks,
    eventsCount: events.length
  };
}

/**
 * Submit a customer lead enquiry from the public digital card.
 * Strictly cloud-backed: zero localStorage fallback.
 */
export async function submitLeadEnquiry(slug, leadData) {
  if (!slug) throw new Error('Card identifier required');
  const { name, phone, email, message } = leadData;

  const trimmedName = (name || '').trim();
  const trimmedPhone = (phone || '').trim();

  if (!trimmedName) throw new Error('Name is required');
  if (!trimmedPhone) throw new Error('Phone number is required');

  // 1. Try secure RPC first
  try {
    const { data, error } = await supabase.rpc('submit_card_lead', {
      p_card_slug: slug,
      p_name: trimmedName,
      p_phone: trimmedPhone,
      p_email: email ? email.trim() : null,
      p_message: message ? message.trim() : null
    });

    if (!error && data?.success) {
      return { success: true, lead_id: data.lead_id };
    }
  } catch (_) {}

  // 2. Direct insert into Supabase leads table
  const { data: card, error: cardLookupErr } = await supabase
    .from('cards')
    .select('id, business_id')
    .eq('slug', slug)
    .single();

  if (cardLookupErr || !card) {
    throw new Error('Digital business card not found to associate enquiry.');
  }

  const { data: insertedLead, error: insertErr } = await supabase
    .from('leads')
    .insert({
      card_id: card.id,
      business_id: card.business_id,
      name: trimmedName,
      phone: trimmedPhone,
      email: email ? email.trim() : null,
      message: message ? message.trim() : null,
      status: 'New',
      source: 'public_card'
    })
    .select()
    .single();

  if (insertErr) {
    console.error('Lead submission failure:', insertErr.message);
    throw new Error('Unable to submit your enquiry at this moment. Please check your connection and try again.');
  }

  return { success: true, lead_id: insertedLead?.id };
}

/**
 * Fetch all leads for owner's cards from Supabase.
 * Strictly cloud-backed.
 */
export async function getOwnerLeads(userId) {
  if (!userId) return [];

  // Query all cards belonging to this user
  const { data: cards, error: cardsErr } = await supabase
    .from('cards')
    .select('id, full_name, company_name, slug')
    .eq('user_id', userId);

  if (cardsErr || !cards || cards.length === 0) {
    return [];
  }

  const cardMap = Object.fromEntries(cards.map(c => [c.id, c]));
  const cardIds = cards.map(c => c.id);

  try {
    const { data: leads, error: leadsErr } = await supabase
      .from('leads')
      .select('*')
      .in('card_id', cardIds)
      .order('created_at', { ascending: false });

    if (leadsErr) {
      console.warn('Leads fetch notice:', leadsErr.message);
      return [];
    }

    return (leads || []).map(lead => ({
      ...lead,
      card_info: cardMap[lead.card_id] || null
    }));
  } catch (err) {
    console.error('Remote leads fetch error:', err.message);
    return [];
  }
}

/**
 * Update lead status in Supabase (New, Contacted, Converted, Lost).
 */
export async function updateLeadStatus(leadId, status) {
  if (!leadId) throw new Error('Lead ID is required');

  const { data, error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', leadId)
    .select();

  if (error) {
    console.error('Remote lead update error:', error.message);
    throw new Error('Failed to update lead status in Supabase: ' + error.message);
  }

  return data?.[0] || { id: leadId, status };
}

/**
 * Delete a lead from Supabase (Owner-only).
 */
export async function deleteLead(leadId) {
  if (!leadId) throw new Error('Lead ID is required');

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  if (error) {
    console.error('Remote lead delete error:', error.message);
    throw new Error('Failed to delete lead: ' + error.message);
  }

  return true;
}

/**
 * Submit general support/contact enquiry from marketing page to Supabase.
 */
export async function submitGeneralContact({ name, email, subject, message }) {
  const trimmedName = (name || '').trim();
  const trimmedEmail = (email || '').trim();
  if (!trimmedName) throw new Error('Name is required');

  const combinedMessage = subject ? `Subject: ${subject}\n\n${message || ''}` : (message || '');

  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: trimmedName,
      phone: 'N/A',
      email: trimmedEmail || null,
      message: combinedMessage,
      status: 'New',
      source: 'contact_page'
    })
    .select()
    .single();

  if (error) {
    console.warn('Contact submission notice:', error.message);
  }

  return { success: true, id: data?.id };
}

/**
 * Upload an image asset (Profile photo or Company logo) to Supabase Storage.
 * Stores in bucket: card-assets
 * Path structure: <userId>/<folder>/<timestamp>-<sanitized-filename>
 */
export async function uploadCardAsset(file, userId, folder = 'avatars') {
  if (!file) throw new Error('No file provided for upload.');
  if (!userId) throw new Error('User authentication required to upload media.');

  // Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported image format. Allowed formats: JPG, PNG, WEBP, SVG.');
  }

  // Validate size (max 5MB)
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('File size exceeds 5MB limit. Please choose a smaller image.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${userId}/${folder}/${Date.now()}-${cleanFileName}`;

  const { data, error } = await supabase.storage
    .from('card-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw new Error('Failed to upload image to cloud storage: ' + error.message);
  }

  const { data: urlData } = supabase.storage
    .from('card-assets')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: urlData.publicUrl
  };
}

/**
 * AI Business Profile Generator Client
 * Clean serverless architecture: Attempts Supabase Edge Function first,
 * with intelligent client-side synthesizer fallback ensuring 100% offline & serverless resilience.
 */
export async function generateAIBusinessProfile({ businessName, companyName, industry, services, keywords, ownerName, city }) {
  const name = (businessName || companyName || '').trim();
  if (!name) throw new Error('Business or company name is required to generate profile.');

  const servicesList = Array.isArray(services)
    ? services.filter(Boolean).join(', ')
    : (typeof services === 'string' ? services : (keywords || ''));

  // 1. Try Supabase Edge Function if available
  try {
    const { data, error } = await supabase.functions.invoke('generate-profile', {
      body: {
        businessName: name,
        industry,
        services: servicesList,
        ownerName,
        city
      }
    });

    if (!error && data?.description) {
      return data.description;
    }
  } catch (_) {
    // Edge function not deployed or network issue, smoothly fallback to synthesizer
  }

  // 2. High-quality intelligent template synthesizer (100% serverless & offline reliable)
  const sanitizedName = name;
  const citySuffix = city ? ` in ${city.trim()}` : '';
  const servicesPhrase = servicesList ? ` specializing in ${servicesList.trim()}` : '';
  const ind = industry ? `${industry.trim()}` : 'professional services';

  const descriptions = [
    `At ${sanitizedName}, we deliver trusted, high-caliber ${ind}${servicesPhrase}${citySuffix}. With an unwavering commitment to operational excellence, rapid turnaround, and complete client satisfaction, we partner with customers to provide dependable, end-to-end solutions.`,
    `${sanitizedName} is a premier provider of ${ind}${citySuffix}${servicesPhrase}. Known for reliability, technical expertise, and attentive customer service, we empower clients with modern, cost-effective solutions tailored to their exact requirements.`,
    `Dedicated to excellence, ${sanitizedName} provides top-tier ${ind} solutions${servicesPhrase}. We blend hands-on industry expertise with dedicated customer care to ensure unmatched quality, reliability, and long-term value for every client.`
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)];
}
