const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db, initDatabase } = require('./config/database');

async function seed() {
  await initDatabase();
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);

  // 1. Create or ensure Demo and Admin users
  const adminId = 'admin-user-001';
  const demoUserId = 'demo-user-001';

  db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(adminId, 'Admin Administrator', 'admin@digitalcard.com', adminPasswordHash, 'ADMIN');

  db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(demoUserId, 'Sudheer Borra', 'demo@digitalcard.com', passwordHash, 'USER');

  // 2. Create the reference card: Sudheer Borra / RUSHI Power Systems
  const cardId = 'card-sudheer-borra-001';
  db.prepare(`
    INSERT OR REPLACE INTO cards (
      id, user_id, username, full_name, designation, phone, alternate_phone,
      email, whatsapp, website, company_name, company_logo, company_description,
      industry, gst_number, registration_number, tagline, theme,
      primary_color, secondary_color, button_style, card_style, font_family,
      status, views_count, scans_count, downloads_count
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      'active', 148, 89, 64
    )
  `).run(
    cardId,
    demoUserId,
    'sudheer-borra',
    'Sudheer Borra',
    'Managing Director',
    '+91 98765 43210',
    '+91 98765 43211',
    'sudheer.borra@rushipower.com',
    '+919876543210',
    'https://www.rushipower.com',
    'RUSHI Power Systems Pvt. Ltd.',
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
    'Pioneering turnkey electrical systems, industrial substations, and smart grid automation since 2008.',
    'Electrical & Energy Engineering',
    '36AABCR1234F1Z8',
    'U40100TG2008PTC059123',
    'ISO 9001:2015 Certified Power Solutions',
    'corporate-blue',
    '#0B2E59',
    '#2563EB',
    'rounded',
    'modern',
    'Inter'
  );

  // Also seed alias card 'rushipower'
  const aliasCardId = 'card-rushipower-002';
  db.prepare(`
    INSERT OR REPLACE INTO cards (
      id, user_id, username, full_name, designation, phone, alternate_phone,
      email, whatsapp, website, company_name, company_logo, company_description,
      industry, gst_number, registration_number, tagline, theme,
      primary_color, secondary_color, button_style, card_style, font_family,
      status, views_count, scans_count, downloads_count
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      'active', 94, 52, 38
    )
  `).run(
    aliasCardId,
    demoUserId,
    'rushipower',
    'Sudheer Borra',
    'Managing Director',
    '+91 98765 43210',
    '+91 98765 43211',
    'info@rushipower.com',
    '+919876543210',
    'https://www.rushipower.com',
    'RUSHI Power Systems Pvt. Ltd.',
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
    'Pioneering turnkey electrical systems, industrial substations, and smart grid automation since 2008.',
    'Electrical & Energy Engineering',
    '36AABCR1234F1Z8',
    'U40100TG2008PTC059123',
    'ISO 9001:2015 Certified Power Solutions',
    'corporate-blue',
    '#0B2E59',
    '#2563EB',
    'rounded',
    'modern',
    'Inter'
  );

  // 3. Clear and insert addresses
  db.prepare('DELETE FROM addresses WHERE card_id IN (?, ?)').run(cardId, aliasCardId);

  const insertAddr = db.prepare(`
    INSERT INTO addresses (id, card_id, type, address, city, state, country, pincode, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [cardId, aliasCardId].forEach(cId => {
    insertAddr.run(
      crypto.randomUUID(),
      cId,
      'Registered Office',
      'Plot No. 42, Phase-II, Industrial Development Area, Cherlapally',
      'Hyderabad',
      'Telangana',
      'India',
      '500051',
      0
    );

    insertAddr.run(
      crypto.randomUUID(),
      cId,
      'Factory Office',
      'Survey No. 128/A, Tech Industrial Zone, Medchal Malkajgiri',
      'Hyderabad',
      'Telangana',
      'India',
      '501401',
      1
    );
  });

  // 4. Clear and insert social links
  db.prepare('DELETE FROM social_links WHERE card_id IN (?, ?)').run(cardId, aliasCardId);

  const insertSocial = db.prepare(`
    INSERT INTO social_links (id, card_id, platform, url, is_active, display_order)
    VALUES (?, ?, ?, ?, 1, ?)
  `);

  [cardId, aliasCardId].forEach(cId => {
    insertSocial.run(crypto.randomUUID(), cId, 'linkedin', 'https://linkedin.com/company/rushipower', 0);
    insertSocial.run(crypto.randomUUID(), cId, 'whatsapp', 'https://wa.me/919876543210', 1);
    insertSocial.run(crypto.randomUUID(), cId, 'twitter', 'https://twitter.com/rushipower', 2);
    insertSocial.run(crypto.randomUUID(), cId, 'facebook', 'https://facebook.com/rushipower', 3);
    insertSocial.run(crypto.randomUUID(), cId, 'youtube', 'https://youtube.com/@rushipower', 4);
  });

  // 5. Populate analytics events over past 7 days
  db.prepare('DELETE FROM analytics_events WHERE card_id IN (?, ?)').run(cardId, aliasCardId);

  const insertEvent = db.prepare(`
    INSERT INTO analytics_events (id, card_id, event_type, referrer, user_agent, device_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const eventTypes = ['view', 'scan', 'vcard_download', 'call_click', 'whatsapp_click', 'email_click', 'website_click', 'map_click', 'share_click'];
  const devices = ['mobile', 'mobile', 'mobile', 'desktop'];

  for (let i = 0; i < 45; i++) {
    const dayOffset = `-${Math.floor(Math.random() * 7)} days`;
    const randEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const randDevice = devices[Math.floor(Math.random() * devices.length)];
    insertEvent.run(
      crypto.randomUUID(),
      cardId,
      randEvent,
      'https://google.com',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      randDevice,
      dayOffset
    );
  }

  console.log('✅ Seeding completed successfully!');
  console.log('👉 Demo Card URL: /card/sudheer-borra');
  console.log('👉 Demo Card Alias: /card/rushipower');
  console.log('👉 Demo User Login: demo@digitalcard.com / Password123!');
  console.log('👉 Admin Login: admin@digitalcard.com / AdminPass123!');
}

seed().catch(console.error);
