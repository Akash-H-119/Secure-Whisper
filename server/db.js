// server/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Railway Postgres typically needs this
});

pool.on('connect', () => console.log('✅ Postgres connected'));
pool.on('error', (err) => {
  console.error('❌ Unexpected Postgres error', err);
  process.exit(-1);
});

export async function initDb() {
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS friends (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      friend_id INTEGER REFERENCES users(id),
      UNIQUE(user_id, friend_id)
    );
  `);

  console.log('✅ Tables checked/created');
}

export default pool;
