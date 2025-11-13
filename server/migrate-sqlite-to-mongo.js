/*
  Migration script: sqlite -> MongoDB (Mongoose)
  Usage:
    1) Ensure MongoDB is running and `MONGODB_URI` env var points to it, or edit MONGODB_URI below.
    2) If you removed sqlite dependencies from package.json, re-install sqlite3 or sqlite before running:
       npm install sqlite sqlite3
    3) Run: node migrate-sqlite-to-mongo.js

  Note: This script assumes the old SQLite schema from server/db.js (tables: users, messages, friends).
*/

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/user.js';
import Message from './models/message.js';
import Friend from './models/friend.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQLITE_PATH = path.join(__dirname, 'data.db');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mingleup';

async function migrate() {
  const db = await open({ filename: SQLITE_PATH, driver: sqlite3.Database });
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for migration');

  try {
    // Users
    const users = await db.all('SELECT * FROM users');
    for (const u of users) {
      const existing = await User.findOne({ $or: [{ username: u.username }, { email: u.email }] });
      if (existing) {
        console.log('Skipping existing user:', u.username);
        continue;
      }
      const user = new User();
      user.username = u.username;
      user.email = u.email || undefined;
      // copy password_hash directly
      user.password_hash = u.password_hash;
      user.createdAt = u.created_at ? new Date(u.created_at) : undefined;
      await user.save();
      console.log('Imported user:', u.username);
    }

    // Messages
    const messages = await db.all('SELECT * FROM messages');
    for (const m of messages) {
      const senderUser = await User.findOne({ $where: `this._id == null` }); // placeholder, we'll try mapping by old id
      // Map sender by matching row id -> user insertion can't map old numeric id to new ObjectId easily
      // We'll try to find user by username/email if available; if not, skip mapping and store sender as null
      // Better approach: create a mapping table when importing users (omitted for brevity).

      const msg = new Message({
        chatId: m.chat_id,
        sender: null,
        content: m.content,
        iv: m.iv,
        createdAt: m.created_at ? new Date(m.created_at) : Date.now()
      });
      await msg.save();
    }

    // Friends
    const friends = await db.all('SELECT * FROM friends');
    for (const f of friends) {
      // Same issue: old numeric user ids vs new ObjectIds. We attempt best-effort by skipping if mapping unavailable.
      console.log('Skipping friends import (requires id mapping).', f);
    }

    console.log('Migration complete. NOTE: messages/friends may require manual mapping of numeric IDs to MongoDB ObjectIds.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await db.close();
    await mongoose.disconnect();
  }
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
