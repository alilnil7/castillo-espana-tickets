// config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../castle.db'));

const dbPromise = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },
  
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

const initDatabase = async () => {
  // Drop existing table if needed (for development only)
  // await dbPromise.run(`DROP TABLE IF EXISTS map_points`);
  
  // Create map_points table with all columns
  await dbPromise.run(`
    CREATE TABLE IF NOT EXISTS map_points (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      google_place_id TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create point_images table
  await dbPromise.run(`
    CREATE TABLE IF NOT EXISTS point_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      point_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (point_id) REFERENCES map_points(id)
    )
  `);
  
  // Create point_facts table
  await dbPromise.run(`
    CREATE TABLE IF NOT EXISTS point_facts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      point_id TEXT NOT NULL,
      fact TEXT NOT NULL,
      FOREIGN KEY (point_id) REFERENCES map_points(id)
    )
  `);
  
  // Tickets table
  await dbPromise.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_intent_id TEXT UNIQUE NOT NULL,
      user_email TEXT NOT NULL,
      user_name TEXT,
      user_phone TEXT,
      pack_name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      amount INTEGER NOT NULL,
      visit_date TEXT NOT NULL,
      qr_code TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      used_at DATETIME,
      refunded_at DATETIME
    )
  `);
  
  // Booking sessions table
  await dbPromise.run(`
    CREATE TABLE IF NOT EXISTS booking_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      ticket_type TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      visit_date TEXT NOT NULL,
      email TEXT,
      name TEXT,
      phone TEXT,
      amount INTEGER NOT NULL,
      payment_intent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Stripe webhooks table (optional)
  await dbPromise.run(`
    CREATE TABLE IF NOT EXISTS stripe_webhooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT UNIQUE,
      event_type TEXT,
      payment_intent_id TEXT,
      status TEXT,
      received_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ SQLite database initialized with all tables');
};

module.exports = { db, dbPromise, initDatabase };