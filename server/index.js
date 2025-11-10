// server/index.js
// Secure Whisper backend (Postgres-powered)

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { initDb, query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DEBUG: log signals and unhandled errors to help Railway debugging
process.on('SIGTERM', () => {
  console.log('PROCESS SIGNAL: SIGTERM received — graceful shutdown starting');
});
process.on('SIGINT', () => {
  console.log('PROCESS SIGNAL: SIGINT received');
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// periodic heartbeat so logs show the process is alive
setInterval(() => {
  console.log('HEARTBEAT: process alive @', new Date().toISOString());
}, 60_000); // every 60s

// config
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || 'dev_key_32_bytes_long_for_demo!!')
  .padEnd(32)
  .slice(0, 32);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

/* ---------- encryption helpers (AES-256-GCM) ---------- */
function encrypt(text) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv, {
    authTagLength: 16,
  });
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    data: Buffer.concat([encrypted, tag]).toString('base64'),
    iv: iv.toString('base64'),
  };
}

function decrypt(dataBase64, ivBase64) {
  const iv = Buffer.from(ivBase64, 'base64');
  const combined = Buffer.from(dataBase64, 'base64');
  const tag = combined.slice(combined.length - 16);
  const encrypted = combined.slice(0, combined.length - 16);
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv, {
    authTagLength: 16,
  });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

/* ---------- helper: generate JWT ---------- */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET);
}

/* ---------- helper: auth middleware ---------- */
function auth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(match[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/* ---------- App bootstrap ---------- */
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ALLOWED_ORIGINS === '*' ? true : ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  })
);

// Health routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Secure Whisper backend running 🚀' });
});

app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error('Health DB check failed:', err);
    res.status(500).json({ status: 'error', db: 'unreachable' });
  }
});

/* ---------- Auth routes ---------- */
// Register
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const insertText = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email
    `;
    const values = [username, email || null, password_hash];

    const result = await query(insertText, values);
    const user = result.rows[0];

    const safeUser = { id: String(user.id), username: user.username, email: user.email || null };
    const token = signToken(safeUser);
    res.json({ user: safeUser, token });
  } catch (err) {
    if (err?.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { usernameOrEmail, username, password } = req.body || {};
  const identifier = usernameOrEmail || username;
  if (!identifier || !password) return res.status(400).json({ error: 'username/email and password required' });

  try {
    const text = `SELECT id, username, email, password_hash FROM users WHERE username=$1 OR email=$1 LIMIT 1`;
    const result = await query(text, [identifier]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const safeUser = { id: String(user.id), username: user.username, email: user.email };
    const token = signToken(safeUser);
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ---------- Messages ---------- */
app.post('/api/messages', auth, async (req, res) => {
  const { chatId, content } = req.body || {};
  if (!chatId || !content) return res.status(400).json({ error: 'chatId and content required' });

  try {
    const { data, iv } = encrypt(content);
    const insert = `
      INSERT INTO messages (chat_id, sender_id, content, iv)
      VALUES ($1, $2, $3, $4)
      RETURNING id, chat_id, sender_id, content, iv, created_at
    `;
    const values = [chatId, req.user.id, data, iv];
    const result = await query(insert, values);
    const msg = result.rows[0];

    const message = {
      id: String(msg.id),
      chat_id: msg.chat_id,
      sender_id: String(msg.sender_id),
      content,
      created_at: msg.created_at,
    };

    broadcastToChat(chatId, { type: 'message', message });

    res.json({ message });
  } catch (err) {
    console.error('Save message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/messages', auth, async (req, res) => {
  const chatId = req.query.chatId;
  if (!chatId) return res.status(400).json({ error: 'chatId query required' });

  try {
    const text = `
      SELECT id, chat_id, sender_id, content, iv, created_at
      FROM messages
      WHERE chat_id = $1
      ORDER BY created_at ASC
    `;
    const result = await query(text, [chatId]);
    const messages = result.rows.map((r) => ({
      id: String(r.id),
      chat_id: r.chat_id,
      sender_id: String(r.sender_id),
      content: decrypt(r.content, r.iv),
      created_at: r.created_at,
    }));
    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ---------- Friends ---------- */
app.post('/api/friends/add', auth, async (req, res) => {
  const { username, identifier } = req.body || {};
  const ident = identifier || username;
  if (!ident) return res.status(400).json({ error: 'username or email required' });

  try {
    const userQ = `SELECT id, username, email FROM users WHERE username=$1 OR email=$1 LIMIT 1`;
    const found = await query(userQ, [ident]);
    const friend = found.rows[0];
    if (!friend) return res.status(404).json({ error: 'User not found' });

    if (String(friend.id) === String(req.user.id)) return res.status(400).json({ error: 'Cannot add yourself' });

    const upsert = `
      INSERT INTO friends (user_id, friend_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, friend_id) DO NOTHING
    `;
    await query(upsert, [req.user.id, friend.id]);
    await query(upsert, [friend.id, req.user.id]);

    res.json({ friend: { id: String(friend.id), username: friend.username } });
  } catch (err) {
    console.error('Add friend error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/friends', auth, async (req, res) => {
  try {
    const text = `
      SELECT f.friend_id AS id, u.username
      FROM friends f
      JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = $1
    `;
    const result = await query(text, [req.user.id]);
    const friends = result.rows.map((r) => ({ id: String(r.id), username: r.username }));
    res.json({ friends });
  } catch (err) {
    console.error('Get friends error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ---------- WebSocket setup ---------- */
const server = createServer(app);
const wss = new WebSocketServer({ server });
const subs = new Map();

function broadcastToChat(chatId, payload) {
  const msg = JSON.stringify(payload);
  for (const [ws, set] of subs.entries()) {
    if (set.has(chatId) && ws.readyState === ws.OPEN) ws.send(msg);
  }
}

wss.on('connection', (ws) => {
  subs.set(ws, new Set());
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'subscribe' && msg.chatId) {
        subs.get(ws).add(msg.chatId);
        ws.send(JSON.stringify({ type: 'subscribed', chatId: msg.chatId }));
      }
      if (msg.type === 'unsubscribe' && msg.chatId) {
        subs.get(ws).delete(msg.chatId);
        ws.send(JSON.stringify({ type: 'unsubscribed', chatId: msg.chatId }));
      }
    } catch {
      // ignore malformed
    }
  });
  ws.on('close', () => subs.delete(ws));
});

/* ---------- Start server (listen now) and init DB in background ---------- */
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend API + WS server live on port ${PORT}`);
});

// init DB in background — don't block startup / health checks
initDb()
  .then(() => console.log('✅ Postgres initialized (background)'))
  .catch((err) => {
    console.error('❌ Background DB init failed:', err);
    // keep process running; logs will show the error
  });
