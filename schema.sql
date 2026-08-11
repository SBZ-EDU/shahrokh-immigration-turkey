-- Cloudflare D1 — Shahrokh CMS (like WordPress)
-- Run: npx wrangler d1 execute shahrokh-db --file=./schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK(role IN ('admin','user')) DEFAULT 'user',
  createdAt INTEGER
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  coverImage TEXT,
  status TEXT CHECK(status IN ('draft','published')) DEFAULT 'draft',
  authorId TEXT REFERENCES users(id),
  authorName TEXT,
  createdAt INTEGER,
  updatedAt INTEGER,
  category TEXT,
  views INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES users(id),
  name TEXT,
  data TEXT, -- JSON
  createdAt INTEGER
);

-- Seed admin (password: admin123 hashed as demo)
INSERT OR IGNORE INTO users (id, email, password_hash, name, role, createdAt) VALUES ('admin-001', 'admin@shahrokh.ir', 'admin123', 'مدیر شاهرخ', 'admin', strftime('%s','now')*1000);
