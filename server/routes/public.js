const express = require('express');
const router = express.Router();
const { generateVCard } = require('../services/vcardService');
const { generateQRCodeDataURL } = require('../services/qrService');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function getSupabaseHeaders() {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Fetch public card from Supabase REST API (No SQLite)
 */
async function fetchCardFromSupabase(identifier) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const cleanId = encodeURIComponent(identifier.trim());
  const url = `${SUPABASE_URL}/rest/v1/cards?or=(slug.eq.${cleanId},id.eq.${cleanId})&is_active=eq.true&select=*`;
  const res = await fetch(url, { headers: getSupabaseHeaders() });
  if (!res.ok) return null;
  const cards = await res.json();
  return cards && cards.length > 0 ? cards[0] : null;
}

/**
 * Record analytics event via Supabase RPC (No SQLite)
 */
async function recordEventInSupabase(cardSlugOrId, eventType) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/record_card_event`, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({
        p_card_slug: cardSlugOrId,
        p_event_type: eventType
      })
    });
  } catch (err) {
    console.warn('Analytics event record warning:', err.message);
  }
}

// Get public card by slug or username
router.get(['/c/:slug', '/card/:username'], async (req, res) => {
  try {
    const identifier = (req.params.slug || req.params.username || '').toLowerCase();
    const card = await fetchCardFromSupabase(identifier);

    if (!card) {
      return res.status(404).json({ error: 'This digital business card does not exist or is inactive.' });
    }

    // Generate dynamic QR data URL
    const host = req.get('host');
    const protocol = req.protocol;
    const cardUrl = `${protocol}://${host}/c/${card.slug}`;
    let qrDataUrl = '';
    try {
      qrDataUrl = await generateQRCodeDataURL(cardUrl, {
        darkColor: card.primary_color || '#0B2E59',
        lightColor: '#FFFFFF',
        width: 400
      });
    } catch (qrErr) {
      console.warn('QR preview generation warning:', qrErr.message);
    }

    res.json({
      card: {
        ...card,
        qr_data_url: qrDataUrl,
        public_url: cardUrl
      }
    });
  } catch (err) {
    console.error('Public card fetch error:', err);
    res.status(500).json({ error: 'Failed to load digital business card.' });
  }
});

// Track page view
router.post('/cards/:id/view', async (req, res) => {
  await recordEventInSupabase(req.params.id, 'page_view');
  res.json({ status: 'ok' });
});

// Track QR scan
router.post('/cards/:id/scan', async (req, res) => {
  await recordEventInSupabase(req.params.id, 'qr_scan');
  res.json({ status: 'ok' });
});

// Track button click
router.post('/cards/:id/click', async (req, res) => {
  const { eventType } = req.body;
  const validEvents = [
    'call_click',
    'whatsapp_click',
    'email_click',
    'website_click',
    'location_click',
    'vcard_download',
    'share'
  ];

  if (validEvents.includes(eventType)) {
    await recordEventInSupabase(req.params.id, eventType);
  }
  res.json({ status: 'ok' });
});

// Public vCard download by slug or ID
router.get(['/cards/:id/vcard', '/vcard/:slug'], async (req, res) => {
  try {
    const identifier = req.params.id || req.params.slug;
    const card = await fetchCardFromSupabase(identifier);
    if (!card) return res.status(404).send('Card not found');

    const vcf = generateVCard(card);
    await recordEventInSupabase(card.slug || card.id, 'vcard_download');

    const filename = `${card.slug || 'contact'}.vcf`;
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(vcf);
  } catch (err) {
    console.error('vCard error:', err);
    res.status(500).send('Error generating vCard');
  }
});

module.exports = router;
