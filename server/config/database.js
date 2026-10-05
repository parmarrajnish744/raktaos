const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'digital_cards.db');

let rawDb = null;
let SQL = null;

// Synchronous wrapper interface matching sqlite prepare/get/all/run
class DBWrapper {
  constructor() {}

  init() {
    // If rawDb is already initialized, return
    if (rawDb) return;
  }

  save() {
    if (!rawDb) return;
    try {
      const data = rawDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (err) {
      console.error('Error saving SQLite database:', err);
    }
  }

  exec(sql) {
    if (!rawDb) throw new Error('DB not initialized');
    rawDb.run(sql);
    this.save();
  }

  prepare(sql) {
    const self = this;
    return {
      run(...params) {
        if (!rawDb) throw new Error('DB not initialized');
        // Convert undefined to null
        const sanitized = params.map(p => p === undefined ? null : p);
        rawDb.run(sql, sanitized);
        self.save();
        return { changes: 1 };
      },

      get(...params) {
        if (!rawDb) throw new Error('DB not initialized');
        const sanitized = params.map(p => p === undefined ? null : p);
        const stmt = rawDb.prepare(sql);
        stmt.bind(sanitized);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },

      all(...params) {
        if (!rawDb) throw new Error('DB not initialized');
        const sanitized = params.map(p => p === undefined ? null : p);
        const stmt = rawDb.prepare(sql);
        stmt.bind(sanitized);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  }

  transaction(fn) {
    const self = this;
    return (...args) => {
      self.exec('BEGIN TRANSACTION;');
      try {
        const result = fn(...args);
        self.exec('COMMIT;');
        self.save();
        return result;
      } catch (err) {
        try { self.exec('ROLLBACK;'); } catch (e) {}
        throw err;
      }
    };
  }
}

const dbWrapper = new DBWrapper();

async function initDatabase() {
  if (rawDb) return dbWrapper;
  SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    rawDb = new SQL.Database(fileBuffer);
  } else {
    rawDb = new SQL.Database();
  }

  // Schema creation
  rawDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      profile_photo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      designation TEXT NOT NULL,
      phone TEXT NOT NULL,
      alternate_phone TEXT,
      email TEXT NOT NULL,
      whatsapp TEXT,
      website TEXT,
      company_name TEXT NOT NULL,
      company_logo TEXT,
      company_description TEXT,
      industry TEXT,
      gst_number TEXT,
      registration_number TEXT,
      tagline TEXT,
      theme TEXT DEFAULT 'corporate-blue',
      primary_color TEXT DEFAULT '#0B2E59',
      secondary_color TEXT DEFAULT '#2563EB',
      button_style TEXT DEFAULT 'rounded',
      card_style TEXT DEFAULT 'modern',
      font_family TEXT DEFAULT 'Inter',
      status TEXT DEFAULT 'active',
      views_count INTEGER DEFAULT 0,
      scans_count INTEGER DEFAULT 0,
      downloads_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL,
      type TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      country TEXT NOT NULL,
      pincode TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      referrer TEXT,
      user_agent TEXT,
      device_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  dbWrapper.save();
  return dbWrapper;
}

module.exports = dbWrapper;
module.exports.db = dbWrapper;
module.exports.initDatabase = initDatabase;
