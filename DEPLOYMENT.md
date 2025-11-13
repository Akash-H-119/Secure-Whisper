# Deployment Guide for SecureChat

This guide covers deploying SecureChat to Render or similar platforms.

## Project Structure

- **Frontend**: React + Vite application in the root directory
- **Backend**: Express + MongoDB server in the `server/` directory

## Prerequisites

- MongoDB database (Render provides this)
- Node.js 18+
- Git repository

## Deployment Steps

### 1. Prepare Environment Variables

#### Frontend Environment Variables
Set the following in your deployment platform:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

#### Backend Environment Variables
Set the following in your deployment platform:

```
JWT_SECRET=<generate-a-random-secret>
ENCRYPTION_KEY=<32-byte-key-for-encryption>
PORT=4000
MONGODB_URI=<from-database-connection-string>
```

### 2. Render.com Deployment

#### Option A: Using Blueprint (render.yaml)

1. Connect your GitHub repository to Render
2. Select "New Blueprint" deployment
3. Render will automatically use `render.yaml` and create:
   - Backend service (securechat-backend)
   - Frontend service (securechat-frontend)
   - MongoDB database (securechat-db)

#### Option B: Manual Deployment

##### Backend Service

1. Create new "Web Service"
2. Connect your repository
3. Configure:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node
   - **Instance Type**: Free tier or higher
4. Add environment variables (see above)

##### Frontend Service

1. Create new "Static Site" or "Web Service"
2. For Static Site:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: Node
3. For Web Service (if needed):
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist`
   - **Environment**: Node

##### MongoDB Database

1. Create new "MongoDB" database
2. Copy connection string to `MONGODB_URI` in backend environment variables
3. Database name: `mingleup`

### 3. Environment Configuration

#### Development
```bash
# Frontend - Create .env.local
VITE_API_URL=http://localhost:4000

# Backend - Create server/.env
JWT_SECRET=dev_secret
ENCRYPTION_KEY=dev_32_byte_key_for_demo!!1
PORT=4000
MONGODB_URI=mongodb://localhost:27017/mingleup
```

#### Production
Set environment variables in your deployment platform's dashboard:
- VITE_API_URL → Backend service URL
- JWT_SECRET → Generate a secure random string
- ENCRYPTION_KEY → 32-byte encryption key
- MONGODB_URI → Database connection string

### 4. WebSocket Configuration

The application uses WebSockets for real-time messaging. Ensure:
- Your deployment platform supports WebSocket connections
- Render.com supports WebSockets on the free tier
- The WebSocket URL is configured correctly (automatic with render.yaml)

### 5. Post-Deployment Checks

1. ✅ Backend health check: `https://your-backend.onrender.com/api/health`
2. ✅ Frontend loads correctly
3. ✅ User registration works
4. ✅ User login works
5. ✅ WebSocket connections work (check browser console)
6. ✅ Messages send and receive in real-time

## Troubleshooting

### CORS Errors
- Ensure backend CORS allows frontend origin
- Check environment variables are set correctly

### WebSocket Connection Failed
- Verify WebSocket URL uses `wss://` (not `ws://`) in production
- Check firewall/network settings
- Ensure Render service supports WebSockets

### MongoDB Connection Issues
- Verify MONGODB_URI environment variable
- Check database access permissions
- Ensure IP whitelist is configured if needed

### Environment Variables Not Loading
- For Vite: Variables must start with `VITE_`
- Restart services after changing environment variables
- Verify in deployment platform dashboard

## Local Development

1. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   ```

2. Start MongoDB locally (or use cloud)

3. Run backend:
   ```bash
   cd server
   npm start
   ```

4. Run frontend:
   ```bash
   npm run dev
   ```

5. Access:
   - Frontend: http://localhost:8080
   - Backend: http://localhost:4000

## Security Notes

- **Never commit** `.env` files (already in .gitignore)
- Use strong, randomly generated secrets for production
- JWT_SECRET should be at least 32 characters
- ENCRYPTION_KEY must be exactly 32 bytes for AES-256
- Use HTTPS in production (automatically handled by Render)

## Support

For issues or questions:
1. Check Render service logs
2. Check browser console for frontend errors
3. Verify environment variables are set
4. Ensure MongoDB is accessible from backend service

