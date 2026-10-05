const db = require('../config/database');
const crypto = require('crypto');

function recordEvent({ cardId, eventType, referrer, userAgent, deviceType }) {
  try {
    const id = crypto.randomUUID();
    const insertStmt = db.prepare(`
      INSERT INTO analytics_events (id, card_id, event_type, referrer, user_agent, device_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(id, cardId, eventType, referrer || null, userAgent || null, deviceType || null);

    // Update aggregate counters on cards table
    if (eventType === 'view') {
      db.prepare(`UPDATE cards SET views_count = views_count + 1 WHERE id = ?`).run(cardId);
    } else if (eventType === 'scan') {
      db.prepare(`UPDATE cards SET scans_count = scans_count + 1 WHERE id = ?`).run(cardId);
    } else if (eventType === 'vcard_download') {
      db.prepare(`UPDATE cards SET downloads_count = downloads_count + 1 WHERE id = ?`).run(cardId);
    }
  } catch (err) {
    console.error('Failed to record analytics event:', err.message);
  }
}

function getCardAnalytics(cardId) {
  // Aggregate counts
  const card = db.prepare(`SELECT views_count, scans_count, downloads_count FROM cards WHERE id = ?`).get(cardId);
  if (!card) return null;

  // Breakdown by event_type
  const eventCounts = db.prepare(`
    SELECT event_type, COUNT(*) as count
    FROM analytics_events
    WHERE card_id = ?
    GROUP BY event_type
  `).all(cardId);

  const clicksBreakdown = {
    call_click: 0,
    whatsapp_click: 0,
    email_click: 0,
    website_click: 0,
    map_click: 0,
    share_click: 0,
    vcard_download: 0
  };

  eventCounts.forEach(item => {
    if (item.event_type in clicksBreakdown) {
      clicksBreakdown[item.event_type] = item.count;
    }
  });

  // Recent timeline (events by day for past 7 days)
  const timeline = db.prepare(`
    SELECT date(created_at) as date, event_type, COUNT(*) as count
    FROM analytics_events
    WHERE card_id = ? AND created_at >= date('now', '-7 days')
    GROUP BY date(created_at), event_type
    ORDER BY date ASC
  `).all(cardId);

  return {
    views: card.views_count || 0,
    scans: card.scans_count || 0,
    downloads: card.downloads_count || 0,
    clicks: clicksBreakdown,
    timeline
  };
}

module.exports = {
  recordEvent,
  getCardAnalytics
};
