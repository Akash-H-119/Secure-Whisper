// =======================
// ✅ Secure Whisper Backend
// =======================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/user.js";
import Message from "./models/message.js";
import Friend from "./models/friend.js";

// Load .env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Railway automatically provides process.env.PORT
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || "dev_key_32_bytes_long_for_demo!!")
  .padEnd(32)
  .slice(0, 32);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/securewhisper";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "*";

// ========== Encryption Helpers ==========
function encrypt(text) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY), iv, {
    authTagLength: 16,
  });
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    data: Buffer.concat([encrypted, tag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

function decrypt(dataBase64, ivBase64) {
  const iv = Buffer.from(ivBase64, "base64");
  const combined = Buffer.from(dataBase64, "base64");
  const tag = combined.slice(combined.length - 16);
  const encrypted = combined.slice(0, combined.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY), iv, {
    authTagLength: 16,
  });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

// ========== Main App ==========
async function main() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }

  const app = express();

  // CORS for Railway frontend
  app.use(
    cors({
      origin: ALLOWED_ORIGINS.split(",").map((o) => o.trim()), // supports multiple domains if comma-separated
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());

  // Simple health route
  app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Secure Whisper backend running 🚀" });
  });

  // ---------- Authentication Middleware ----------
  function auth(req, res, next) {
    const authHeader = req.headers["authorization"] || "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: "Missing token" });
    try {
      const payload = jwt.verify(match[1], JWT_SECRET);
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  // ---------- Auth Routes ----------
  app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });
    try {
      const password_hash = await bcrypt.hash(password, 10);
      const user = new User({ username, email: email || null, password_hash });
      await user.save();
      const safeUser = {
        id: user._id.toString(),
        username: user.username,
        email: user.email || null,
      };
      const token = jwt.sign(safeUser, JWT_SECRET);
      res.json({ user: safeUser, token });
    } catch (err) {
      if (err.code === 11000)
        return res.status(400).json({ error: "Username or email already exists" });
      console.error("Register error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { usernameOrEmail, username, password } = req.body || {};
    const identifier = usernameOrEmail || username;
    if (!identifier || !password)
      return res.status(400).json({ error: "username/email and password required" });
    try {
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });
      if (!user) return res.status(400).json({ error: "Invalid credentials" });
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(400).json({ error: "Invalid credentials" });
      const safeUser = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      };
      const token = jwt.sign(safeUser, JWT_SECRET);
      res.json({ user: safeUser, token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ---------- Message Routes ----------
  app.post("/api/messages", auth, async (req, res) => {
    const { chatId, content } = req.body || {};
    if (!chatId || !content)
      return res.status(400).json({ error: "chatId and content required" });
    try {
      const { data, iv } = encrypt(content);
      const msg = new Message({
        chatId,
        sender: req.user.id,
        content: data,
        iv,
        createdAt: Date.now(),
      });
      await msg.save();
      const message = {
        id: msg._id.toString(),
        chat_id: msg.chatId,
        sender_id: req.user.id,
        content,
        created_at: msg.createdAt,
      };
      broadcastToChat(chatId, { type: "message", message });
      res.json({ message });
    } catch (err) {
      console.error("Save message error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/messages", auth, async (req, res) => {
    const chatId = req.query.chatId;
    if (!chatId) return res.status(400).json({ error: "chatId query required" });
    try {
      const rows = await Message.find({ chatId }).sort({ createdAt: 1 }).lean();
      const messages = rows.map((r) => ({
        id: r._id.toString(),
        chat_id: r.chatId,
        sender_id: r.sender.toString(),
        content: decrypt(r.content, r.iv),
        created_at: r.createdAt,
      }));
      res.json({ messages });
    } catch (err) {
      console.error("Get messages error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ---------- Friends Routes ----------
  app.post("/api/friends/add", auth, async (req, res) => {
    const { username, identifier } = req.body || {};
    const ident = identifier || username;
    if (!ident)
      return res.status(400).json({ error: "username or email required" });
    try {
      const friend = await User.findOne({
        $or: [{ username: ident }, { email: ident }],
      }).select("_id username email");
      if (!friend) return res.status(404).json({ error: "User not found" });
      if (friend._id.toString() === req.user.id)
        return res.status(400).json({ error: "Cannot add yourself" });

      const existingFriendship = await Friend.findOne({
        user: req.user.id,
        friend: friend._id,
      });
      if (existingFriendship)
        return res.status(400).json({ error: "Already friends" });

      await new Friend({ user: req.user.id, friend: friend._id }).save();
      await new Friend({ user: friend._id, friend: req.user.id }).save();

      console.log("🤝 Friendship created:", req.user.id, "<->", friend._id);
      res.json({
        friend: { id: friend._id.toString(), username: friend.username },
      });
    } catch (err) {
      console.error("Add friend error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/friends", auth, async (req, res) => {
    try {
      const rows = await Friend.find({ user: req.user.id })
        .populate("friend", "username")
        .lean();
      const friends = rows.map((r) => ({
        id: r.friend._id.toString(),
        username: r.friend.username,
      }));
      res.json({ friends });
    } catch (err) {
      console.error("Get friends error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========== WebSocket Setup ==========
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const subs = new Map();

  function broadcastToChat(chatId, payload) {
    const msg = JSON.stringify(payload);
    for (const [ws, set] of subs.entries()) {
      if (set.has(chatId) && ws.readyState === ws.OPEN) ws.send(msg);
    }
  }

  wss.on("connection", (ws) => {
    subs.set(ws, new Set());
    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "subscribe" && msg.chatId) {
          subs.get(ws).add(msg.chatId);
          ws.send(JSON.stringify({ type: "subscribed", chatId: msg.chatId }));
        }
        if (msg.type === "unsubscribe" && msg.chatId) {
          subs.get(ws).delete(msg.chatId);
          ws.send(JSON.stringify({ type: "unsubscribed", chatId: msg.chatId }));
        }
      } catch {
        // ignore malformed
      }
    });
    ws.on("close", () => subs.delete(ws));
  });

  server.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Backend API + WS server live on port ${PORT}`)
  );
}

// Start the server
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
