
const Database = require("better-sqlite3");
const path = require("path");

const databasePath = path.join(
  __dirname,
  "gold-gallery.db",
);

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

// Create the initial database tables.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    items TEXT NOT NULL,
    total_price_toman INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Migration: add admin permissions to existing users.
const userColumns = db.pragma("table_info(users)");

const hasAdminColumn = userColumns.some(
  (column) => column.name === "is_admin",
);

if (!hasAdminColumn) {
  db.exec(`
    ALTER TABLE users
    ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0
    CHECK (is_admin IN (0, 1));
  `);
}

// Create seller applications.
db.exec(`
  CREATE TABLE IF NOT EXISTS seller_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL
      REFERENCES users(id),

    shop_name TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'rejected')),

    submitted_at TEXT NOT NULL,
    reviewed_at TEXT,

    reviewed_by INTEGER
      REFERENCES users(id),

    rejection_reason TEXT,

    CHECK (
      (
        status = 'pending'
        AND reviewed_at IS NULL
        AND reviewed_by IS NULL
      )
      OR
      (
        status IN ('approved', 'rejected')
        AND reviewed_at IS NOT NULL
        AND reviewed_by IS NOT NULL
      )
    )
  );

  CREATE UNIQUE INDEX IF NOT EXISTS
    idx_one_pending_application_per_user
  ON seller_applications(user_id)
  WHERE status = 'pending';
`);

// Create shops for approved sellers.
db.exec(`
  CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    owner_user_id INTEGER NOT NULL UNIQUE
      REFERENCES users(id),

    application_id INTEGER NOT NULL UNIQUE
      REFERENCES seller_applications(id),

    shop_name TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'suspended')),

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

module.exports = db;
