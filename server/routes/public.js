const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { recordEvent } = require('../services/analyticsService');
const { generateVCard } = require('../services/vcardService');
const { generateQRCodeDataURL } = require('../services/qrService');

// Get public card by username
router.get('/card/:username', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const card = db.prepare('SELECT * FROM cards WHERE LOWER(username) = ?').get(username);

    if (!card) {
      return res.status(404).json({ error: 'This digital business card does not exist.' });
    }

    if (card.status !== 'active') {
      return res.status(403).json({ error: 'This digital business card is currently inactive or suspended.' });
    }

    const addresses = db.prepare('SELECT * FROM addresses WHERE card_id = ? ORDER BY display_order ASC').all(card.id);
    const social_links = db.prepare('SELECT * FROM social_links WHERE card_id = ? AND is_active = 1 ORDER BY display_order ASC').all(card.id);

    // Generate dynamic QR data URL
    const host = req.get('host');
    const protocol = req.protocol;
    const cardUrl = `${protocol}://${host}/card/${card.username}`;
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
        addresses,
        social_links,
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
router.post('/cards/:id/view', (req, res) => {
  const cardId = req.params.id;
  const userAgent = req.headers['user-agent'] || '';
  const referrer = req.headers['referer'] || '';
  const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : 'desktop';

  recordEvent({
    cardId,
    eventType: 'view',
    referrer,
    userAgent,
    deviceType
  });

  res.json({ status: 'ok' });
});

// Track QR scan
router.post('/cards/:id/scan', (req, res) => {
  const cardId = req.params.id;
  const userAgent = req.headers['user-agent'] || '';
  const referrer = req.headers['referer'] || '';
  const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : 'desktop';

  recordEvent({
    cardId,
    eventType: 'scan',
    referrer,
    userAgent,
    deviceType
  });

  res.json({ status: 'ok' });
});

// Track button click
router.post('/cards/:id/click', (req, res) => {
  const cardId = req.params.id;
  const { eventType } = req.body;
  const validEvents = [
    'call_click',
    'whatsapp_click',
    'email_click',
    'website_click',
    'map_click',
    'vcard_download',
    'share_click'
  ];

  if (!validEvents.includes(eventType)) {
    return res.status(400).json({ error: 'Invalid click event type' });
  }

  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : 'desktop';

  recordEvent({
    cardId,
    eventType,
    referrer: req.headers['referer'] || '',
    userAgent,
    deviceType
  });

  res.json({ status: 'ok' });
});

// Get public card by slug or username
router.get(['/c/:slug', '/card/:username'], async (req, res) => {
  try {
    const identifier = (req.params.slug || req.params.username).toLowerCase();
    const card = db.prepare('SELECT * FROM cards WHERE LOWER(username) = ? OR id = ?').get(identifier, identifier);

    if (!card) {
      return res.status(404).json({ error: 'This digital business card does not exist.' });
    }

    if (card.status !== 'active') {
      return res.status(403).json({ error: 'This digital business card is currently inactive or suspended.' });
    }

    const addresses = db.prepare('SELECT * FROM addresses WHERE card_id = ? ORDER BY display_order ASC').all(card.id);
    const social_links = db.prepare('SELECT * FROM social_links WHERE card_id = ? AND is_active = 1 ORDER BY display_order ASC').all(card.id);

    // Generate dynamic QR data URL
    const host = req.get('host');
    const protocol = req.protocol;
    const cardUrl = `${protocol}://${host}/c/${card.username}`;
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
        slug: card.username,
        addresses,
        social_links,
        qr_data_url: qrDataUrl,
        public_url: cardUrl
      }
    });
  } catch (err) {
    console.error('Public card fetch error:', err);
    res.status(500).json({ error: 'Failed to load digital business card.' });
  }
});

// Public vCard download by ID or slug
router.get(['/cards/:id/vcard', '/vcard/:slug'], (req, res) => {
  try {
    const identifier = req.params.id || req.params.slug;
    const card = db.prepare('SELECT * FROM cards WHERE id = ? OR LOWER(username) = ?').get(identifier, identifier.toLowerCase());
    if (!card) return res.status(404).send('Card not found');

    const addresses = db.prepare('SELECT * FROM addresses WHERE card_id = ? ORDER BY display_order ASC').all(card.id);
    const vcf = generateVCard(card, addresses);

    // Track download event
    recordEvent({
      cardId: card.id,
      eventType: 'vcard_download',
      referrer: req.headers['referer'] || '',
      userAgent: req.headers['user-agent'] || '',
      deviceType: 'unknown'
    });

    const filename = `${card.username || 'contact'}.vcf`;
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(vcf);
  } catch (err) {
    res.status(500).send('Error generating vCard');
  }
});

module.exports = router;
