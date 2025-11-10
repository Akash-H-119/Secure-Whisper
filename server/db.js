// server/db.js
import pkg from 'pg';
const { Pool } = pkg;

/**
 * Use SSL only when DATABASE_URL points to a remote host.
 * For local development (localhost / 127.0.0.1) we avoid SSL.
 */
const DATABASE_URL = process.env.DATABASE_URL || '';
const useSsl = DATABASE_URL && !/localhost|127\.0\.0\.1/.test(DATABASE_URL);

const pool = new Pool({
  connectionString: DATABASE_URL || undefined,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  // Optional: tune pool settings if you want
  // max: 10,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 2000,
});

pool.on('connect', () => console.log('✅ Postgres connected'));
pool.on('error', (err) => {
  console.error('❌ Unexpected Postgres error', err);
  // don't exit here in library code — application can decide. But log loudly.
});

export async function initDb() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Set process.env.DATABASE_URL before calling initDb().');
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id TEXT,
        sender_id INTEGER REFERENCES users(id),
        content TEXT,
        iv TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        friend_id INTEGER REFERENCES users(id),
        UNIQUE(user_id, friend_id)
      );
    `);

    console.log('✅ Tables checked/created');
  } catch (err) {
    console.error('❌ initDb error:', err);
    throw err;
  }
}

/**
 * Convenience helper so other modules can do:
 * import db, { initDb } from './db.js';
 * await db.query('SELECT ...', [params])
 */
export const query = (text, params) => pool.query(text, params);

export default pool;
