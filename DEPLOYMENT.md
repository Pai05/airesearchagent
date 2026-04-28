# Deployment Configuration Guide

## Vercel Frontend Deployment

### Environment Variables for Vercel
No build-time environment variables needed. Runtime configuration is loaded from the backend `/api/config` endpoint.

### Vercel Project Settings
1. **Build & Development Settings:**
   - Framework: None (static HTML/JavaScript)
   - Build Command: (leave empty - no build step)
   - Output Directory: `frontend`
   
2. **Rewrites** (already configured in `vercel.json`):
   - Proxies all `/api/*` requests to your Render backend
   - Update the `destination` URL in `vercel.json` with your actual Render backend URL

## Render Backend Deployment

### Environment Variables for Render
Set these in your Render service settings:

```
ENVIRONMENT=production
CORS_ORIGINS=https://your-vercel-domain.vercel.app
GEMINI_API_KEY=your_gemini_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### Render Service Setup
1. **Create Web Service** from GitHub
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** Use Procfile (already configured)
4. **GitHub Integration:** Connect your repository
5. **Autodeply:** Enabled (deploys on push to main)

## How It Works

1. **Frontend requests** → sent to `/api/*` (same origin)
2. **Vercel rewrite** → `/api/*` → `https://your-render-backend.onrender.com/api/*`
3. **Backend processes** → returns data with CORS headers
4. **Frontend receives** → displays results

## Troubleshooting

### Error: "Could not reach backend"
- Check Render backend is running: `https://your-render-backend.onrender.com/health`
- Verify Vercel domain in `CORS_ORIGINS` env var on Render
- Check `vercel.json` destination URL matches your Render backend URL

### CORS Error
- Ensure `CORS_ORIGINS` on Render includes your Vercel domain
- Or set `ENVIRONMENT=production` to allow all origins

### Firebase Auth Fails
- Ensure all `FIREBASE_*` env vars are set on Render
- Check that `firebase-admin` can load `serviceAccountKey.json`
