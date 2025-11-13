

# SecureChat - End-to-End Encrypted Messaging

SecureChat is a modern, secure messaging application built with React and Express. Features include:
- 🔐 End-to-end encryption (AES-256-GCM)
- 🌐 Real-time messaging via WebSockets
- 👥 Friend management
- 🎨 Modern UI with shadcn/ui components
- 📱 Responsive design

## Tech Stack

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router
- WebSocket client

**Backend:**
- Express.js + Node.js
- MongoDB + Mongoose
- JWT authentication
- WebSocket server

## Quick Start

### Local Development

This requires MongoDB to be running locally or on a cloud instance.

## Run locally (PowerShell)

Follow these commands in two separate terminals: one for the frontend and one for the backend.

1) Frontend (project root)

Install dependencies (run once):
```powershell
cd 'C:\Users\Rohan\OneDrive\Desktop\projects\secure-whisper-22'
npm install
```

Start the dev frontend (Vite):
```powershell
npm run dev
```

Vite typically serves at http://localhost:5173.

2) Backend (separate terminal)

Install backend deps and start:
```powershell
cd 'C:\Users\Rohan\OneDrive\Desktop\projects\secure-whisper-22\server'
npm install
npm start
```

By default the backend listens on http://localhost:4000.

3) Optional: set environment variables for the backend (PowerShell)

You can set a JWT secret and a 32-byte encryption key for AES-256-GCM before starting the backend:
```powershell
$env:JWT_SECRET = 'your_jwt_secret_here'
$env:ENCRYPTION_KEY = '32_byte_secret_key_here___________'
npm start
```

Or create a `server/.env` file with:
```
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_byte_key_here
PORT=4000
```

4) Quick health check (PowerShell)
```powershell
Invoke-RestMethod 'http://localhost:4000/api/health'
```

Expected response:
```json
{ "ok": true }
```

Notes:
- Frontend runs on http://localhost:8080 and backend on http://localhost:4000
- Both servers must be running for full functionality
- MongoDB must be running (local or cloud)
- WebSocket connections are required for real-time messaging

## Deployment

### Deploy to Render.com

1. Push your code to GitHub
2. Connect your repository to Render
3. Use the provided `render.yaml` for automatic setup:
   - Backend service with MongoDB
   - Frontend static site
   - Automatic environment variable configuration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Environment Variables

#### Frontend
```bash
VITE_API_URL=https://your-backend.onrender.com
```

#### Backend
```bash
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-32-byte-encryption-key
PORT=4000
MONGODB_URI=mongodb://...
```

## Features

- ✅ User authentication (register/login)
- ✅ End-to-end encrypted messaging
- ✅ Real-time messaging via WebSockets
- ✅ Friend management
- ✅ Search and add friends
- ✅ Modern, responsive UI

## Project Structure

```
├── src/                # Frontend React app
│   ├── pages/         # Page components
│   ├── components/    # UI components
│   ├── lib/          # Utilities (API config)
│   └── hooks/        # React hooks
├── server/           # Backend Express server
│   ├── models/       # MongoDB models
│   └── index.js      # Server entry point
└── render.yaml       # Render.com deployment config
```

## License

MIT
