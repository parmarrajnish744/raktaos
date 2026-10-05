const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

// Admin overview statistics
router.get('/overview', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalCards = db.prepare('SELECT COUNT(*) as count FROM cards').get().count;
    const activeCards = db.prepare("SELECT COUNT(*) as count FROM cards WHERE status = 'active'").get().count;

    const totals = db.prepare(`
      SELECT
        COALESCE(SUM(views_count), 0) as totalViews,
        COALESCE(SUM(scans_count), 0) as totalScans,
        COALESCE(SUM(downloads_count), 0) as totalDownloads
      FROM cards
    `).get();

    const recentCards = db.prepare(`
      SELECT c.id, c.username, c.full_name, c.company_name, c.status, c.created_at, u.email as owner_email
      FROM cards c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `).all();

    const recentUsers = db.prepare(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    res.json({
      stats: {
        totalUsers,
        totalCards,
        activeCards,
        totalViews: totals.totalViews,
        totalScans: totals.totalScans,
        totalDownloads: totals.totalDownloads
      },
      recentCards,
      recentUsers
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Failed to fetch admin overview.' });
  }
});

// List all users
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             COUNT(c.id) as card_count
      FROM users u
      LEFT JOIN cards c ON u.id = c.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list users.' });
  }
});

// List all cards
router.get('/cards', (req, res) => {
  try {
    const cards = db.prepare(`
      SELECT c.*, u.name as owner_name, u.email as owner_email
      FROM cards c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `).all();

    res.json({ cards });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list cards.' });
  }
});

// Toggle card status
router.patch('/cards/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be active or inactive.' });
    }

    const result = db.prepare(`
      UPDATE cards
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ message: `Card status changed to ${status}`, status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update card status.' });
  }
});

// Admin delete card
router.delete('/cards/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json({ message: 'Card deleted by administrator.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete card.' });
  }
});

module.exports = router;
