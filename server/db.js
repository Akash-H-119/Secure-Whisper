import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "data.db");

export async function getDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Initialize tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT,
      sender_id INTEGER,
      content TEXT,
      iv TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      friend_id INTEGER,
      UNIQUE(user_id, friend_id)
    );
  `);

  return db;
}
