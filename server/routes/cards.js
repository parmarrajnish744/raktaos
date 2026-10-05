const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { generateVCard } = require('../services/vcardService');
const { generateQRCodeDataURL, generateQRCodeSVG, generateQRCodeBuffer } = require('../services/qrService');
const { getCardAnalytics } = require('../services/analyticsService');

// List cards for current user
router.get('/', requireAuth, (req, res) => {
  try {
    const cards = db.prepare(`
      SELECT * FROM cards
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    const getAddresses = db.prepare('SELECT * FROM addresses WHERE card_id = ? ORDER BY display_order ASC');
    const getSocials = db.prepare('SELECT * FROM social_links WHERE card_id = ? ORDER BY display_order ASC');

    const result = cards.map(card => ({
      ...card,
      addresses: getAddresses.all(card.id),
      social_links: getSocials.all(card.id)
    }));

    res.json({ cards: result });
  } catch (err) {
    console.error('Fetch cards error:', err);
    res.status(500).json({ error: 'Failed to fetch business cards.' });
  }
});

// Create new card
router.post('/', requireAuth, (req, res) => {
  try {
    const {
      username,
      full_name,
      designation,
      phone,
      alternate_phone,
      email,
      whatsapp,
      website,
      company_name,
      company_logo,
      company_description,
      industry,
      gst_number,
      registration_number,
      tagline,
      theme,
      primary_color,
      secondary_color,
      button_style,
      card_style,
      font_family,
      addresses = [],
      social_links = []
    } = req.body;

    if (!full_name || !company_name || !phone || !email) {
      return res.status(400).json({ error: 'Full name, company name, phone, and email are required fields.' });
    }

    // Generate or clean username
    let cleanUsername = (username || full_name.toLowerCase().replace(/[^a-z0-9]/g, '-'))
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanUsername) cleanUsername = 'card-' + Date.now().toString(36);

    // Ensure uniqueness
    const existing = db.prepare('SELECT id FROM cards WHERE username = ?').get(cleanUsername);
    if (existing) {
      cleanUsername = `${cleanUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const cardId = crypto.randomUUID();

    // Use transaction for atomic card + addresses + social links insertion
    const createTransaction = db.transaction(() => {
      const insertCard = db.prepare(`
        INSERT INTO cards (
          id, user_id, username, full_name, designation, phone, alternate_phone,
          email, whatsapp, website, company_name, company_logo, company_description,
          industry, gst_number, registration_number, tagline, theme,
          primary_color, secondary_color, button_style, card_style, font_family, status
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, 'active'
        )
      `);

      insertCard.run(
        cardId,
        req.user.id,
        cleanUsername,
        full_name.trim(),
        (designation || '').trim(),
        phone.trim(),
        alternate_phone ? alternate_phone.trim() : null,
        email.trim(),
        whatsapp ? whatsapp.trim() : phone.trim(),
        website ? website.trim() : null,
        company_name.trim(),
        company_logo || null,
        company_description || null,
        industry || null,
        gst_number || null,
        registration_number || null,
        tagline || null,
        theme || 'corporate-blue',
        primary_color || '#0B2E59',
        secondary_color || '#2563EB',
        button_style || 'rounded',
        card_style || 'modern',
        font_family || 'Inter'
      );

      // Insert addresses
      if (Array.isArray(addresses)) {
        const insertAddress = db.prepare(`
          INSERT INTO addresses (id, card_id, type, address, city, state, country, pincode, display_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        addresses.forEach((addr, idx) => {
          if (addr.address || addr.city) {
            insertAddress.run(
              crypto.randomUUID(),
              cardId,
              addr.type || 'Registered Office',
              addr.address || '',
              addr.city || '',
              addr.state || '',
              addr.country || 'India',
              addr.pincode || '',
              idx
            );
          }
        });
      }

      // Insert social links
      if (Array.isArray(social_links)) {
        const insertSocial = db.prepare(`
          INSERT INTO social_links (id, card_id, platform, url, is_active, display_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        social_links.forEach((soc, idx) => {
          if (soc.platform && soc.url) {
            insertSocial.run(
              crypto.randomUUID(),
              cardId,
              soc.platform.toLowerCase(),
              soc.url.trim(),
              soc.is_active !== undefined ? (soc.is_active ? 1 : 0) : 1,
              idx
            );
          }
        });
      }
    });

    createTransaction();

    const createdCard = db.prepare('SELECT * FROM cards WHERE id = ?').get(cardId);
    const cardAddresses = db.prepare('SELECT * FROM addresses WHERE card_id = ? ORDER BY display_order ASC').all(cardId);
    const cardSocials = db.prepare('SELECT * FROM social_links WHERE card_id = ? ORDER BY display_order ASC').all(cardId);

    res.status(201).json({
      message: 'Card created successfully',
      card: {
        ...createdCard,
        addresses: cardAddresses,
        social_links: cardSocials
      }
    });
  } catch (err) {
    console.error('Create card error:', err);
    res.status(500).json({ error: 'Failed to create business card.' });
  }
});

// Get single card by ID
router.get('/:id', requireAuth, (req, res) => {
  try {
    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found.' });

    if (card.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to view this card.' });
    }

    const addresses = db.prepare('SELECT * FROM addresses WHERE card_id = ? ORDER BY display_order ASC').all(card.id);
    const social_links = db.prepare('SELECT * FROM social_links WHERE card_id = ? ORDER BY display_order ASC').all(card.id);

    res.json({
      card: {
        ...card,
        addresses,
        social_links
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch card details.' });
  }
});

// Update card
router.put('/:id', requireAuth, (req, res) => {
  try {
    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found.' });

    if (card.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to edit this card.' });
    }

    const {
      username,
      full_name,
      designation,
      phone,
      alternate_phone,
      email,
      whatsapp,
      website,
      company_name,
      company_logo,
      company_description,
      industry,
      gst_number,
      registration_number,
      tagline,
      theme,
      primary_color,
      secondary_color,
      button_style,
      card_style,
      font_family,
      status,
      addresses = [],
      social_links = []
    } = req.body;

    let targetUsername = card.username;
    if (username && username !== card.username) {
      const clean = username.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      const conflict = db.prepare('SELECT id FROM cards WHERE username = ? AND id != ?').get(clean, card.id);
      if (conflict) {
        return res.status(400).json({ error: 'This card URL username is already taken.' });
      }
      targetUsername = clean;
    }

    const updateTransaction = db.transaction(() => {
      db.prepare(`
        UPDATE cards SET
          username = ?,
          full_name = ?,
          designation = ?,
          phone = ?,
          alternate_phone = ?,
          email = ?,
          whatsapp = ?,
          website = ?,
          company_name = ?,
          company_logo = ?,
          company_description = ?,
          industry = ?,
          gst_number = ?,
          registration_number = ?,
          tagline = ?,
          theme = ?,
          primary_color = ?,
          secondary_color = ?,
          button_style = ?,
          card_style = ?,
          font_family = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        targetUsername,
        (full_name || card.full_name).trim(),
        (designation !== undefined ? designation : card.designation).trim(),
        (phone || card.phone).trim(),
        alternate_phone !== undefined ? alternate_phone : card.alternate_phone,
        (email || card.email).trim(),
        whatsapp !== undefined ? whatsapp : card.whatsapp,
        website !== undefined ? website : card.website,
        (company_name || card.company_name).trim(),
        company_logo !== undefined ? company_logo : card.company_logo,
        company_description !== undefined ? company_description : card.company_description,
        industry !== undefined ? industry : card.industry,
        gst_number !== undefined ? gst_number : card.gst_number,
        registration_number !== undefined ? registration_number : card.registration_number,
        tagline !== undefined ? tagline : card.tagline,
        theme || card.theme,
        primary_color || card.primary_color,
        secondary_color || card.secondary_color,
        button_style || card.button_style,
        card_style || card.card_style,
        font_family || card.font_family,
        status || card.status,
        card.id
      );

      // Re-sync addresses
      if (Array.isArray(addresses)) {
        db.prepare('DELETE FROM addresses WHERE card_id = ?').run(card.id);
        const insertAddress = db.prepare(`
          INSERT INTO addresses (id, card_id, type, address, city, state, country, pincode, display_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        addresses.forEach((addr, idx) => {
          if (addr.address || addr.city) {
            insertAddress.run(
              crypto.randomUUID(),
              card.id,
              addr.type || 'Registered Office',
              addr.address || '',
              addr.city || '',
              addr.state || '',
              addr.country || 'India',
              addr.pincode || '',
              idx
            );
          }
        });
      }

      // Re-sync social links
      if (Array.isArray(social_links)) {
        db.prepare('DELETE FROM social_links WHERE card_id = ?').run(card.id);
        const insertSocial = db.prepare(`
          INSERT INTO social_links (id, card_id, platform, url, is_active, display_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        social_links.forEach((soc, idx) => {
          if (soc.platform && soc.url) {
            insertSocial.run(
              crypto.randomUUID(),
              card.id,
              soc.platform.toLowerCase(),
              soc.url.trim(),
              soc.is_active !== undefined ? (soc.is_active ? 1 : 0) : 1,
              idx
            );
          }
        });
      }
    });

    updateTransaction();

    const updatedCard = db.prepare('SELECT * FROM cards WHERE id = ?').get(card.id);
    const updatedAddresses = db.prepare('SELECT * FROM addresses WHERE card_id = ? ORDER BY display_order ASC').all(card.id);
    const updatedSocials = db.prepare('SELECT * FROM social_links WHERE card_id = ? ORDER BY display_order ASC').all(card.id);

    res.json({
      message: 'Card updated successfully',
      card: {
        ...updatedCard,
        addresses: updatedAddresses,
        social_links: updatedSocials
      }
    });
  } catch (err) {
    console.error('Update card error:', err);
    res.status(500).json({ error: 'Failed to update business card.' });
  }
});

// Delete card
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found.' });

    if (card.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this card.' });
    }

    db.prepare('DELETE FROM cards WHERE id = ?').run(card.id);
    res.json({ message: 'Card deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete card.' });
  }
});

// vCard download
router.get('/:id/vcard', (req, res) => {
  try {
    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
    if (!card) return res.status(404).send('Card not found');

    const addresses = db.prepare('SELECT * FROM addresses WHERE card_id = ? ORDER BY display_order ASC').all(card.id);
    const vcfContent = generateVCard(card, addresses);

    const safeFilename = (card.full_name || 'contact').replace(/[^a-zA-Z0-9_-]/g, '_') + '.vcf';

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.send(vcfContent);
  } catch (err) {
    console.error('vCard generation error:', err);
    res.status(500).send('Failed to generate vCard');
  }
});

// QR Code generator
router.get('/:id/qr', async (req, res) => {
  try {
    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const host = req.get('host');
    const protocol = req.protocol;
    const cardUrl = `${protocol}://${host}/card/${card.username}`;

    const { format = 'dataurl', darkColor, lightColor } = req.query;

    if (format === 'svg') {
      const svg = await generateQRCodeSVG(cardUrl, { darkColor, lightColor });
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(svg);
    }

    if (format === 'png') {
      const buffer = await generateQRCodeBuffer(cardUrl, { darkColor, lightColor });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${card.username}-qr.png"`);
      return res.send(buffer);
    }

    const dataUrl = await generateQRCodeDataURL(cardUrl, { darkColor, lightColor });
    res.json({
      url: cardUrl,
      dataUrl,
      username: card.username
    });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Card Analytics summary
router.get('/:id/analytics', requireAuth, (req, res) => {
  try {
    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    if (card.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const stats = getCardAnalytics(card.id);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

module.exports = router;
