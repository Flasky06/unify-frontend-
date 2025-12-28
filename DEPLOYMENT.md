# Deploying React Frontend to Railway (No Docker)

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- Backend API already deployed at: `https://unify-pos-api-production.up.railway.app`

## Quick Deployment Steps

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Add Railway deployment configuration"
git push
```

### 2. Deploy on Railway

#### Via Railway Dashboard (Recommended)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `tritva.mpos-frontend` repository
5. Railway will automatically:
   - Detect it's a Node.js/Vite project
   - Run `npm install`
   - Run `npm run build`
   - Start with `npm run preview`

### 3. Configure Environment Variable

1. In Railway dashboard, click on your deployed service
2. Go to "Variables" tab
3. Add:
   - **Variable**: `VITE_API_BASE_URL`
   - **Value**: `https://unify-pos-api-production.up.railway.app/api`

### 4. Redeploy (if needed)

After adding the environment variable, Railway will automatically redeploy.

### 5. Get Your URL

Railway will provide a public URL like:
`https://tritva-mpos-frontend-production.up.railway.app`

## Configuration Files

### railway.toml

- Uses Nixpacks builder (auto-detects Node.js)
- Runs `npm run preview` to serve the built app
- Configures health checks and restart policy

### package.json

- Updated `preview` script to:
  - Bind to `0.0.0.0` (accept external connections)
  - Use Railway's `PORT` environment variable

## Important: Update Backend CORS

Your backend needs to allow requests from the Railway frontend URL.

Update `SecurityConfig.java`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",
        "http://localhost:5174",
        "https://tritva-mpos-frontend-production.up.railway.app" // Add your Railway URL
    ));
    // ... rest of config
}
```

## Auto-Deploy

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push
```

## Troubleshooting

### Build Fails

- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### App Shows Blank Page

- Check browser console for errors
- Verify `VITE_API_BASE_URL` environment variable is set
- Check that the API URL is correct

### API Calls Fail (CORS errors)

- Update backend CORS configuration with your Railway frontend URL
- Redeploy backend after CORS update

### Port Issues

- Railway automatically sets the `PORT` environment variable
- The preview script uses `${PORT:-4173}` to handle this

## Environment Variables Summary

Set these in Railway dashboard:

- `VITE_API_BASE_URL` = `https://unify-pos-api-production.up.railway.app/api`

## Build Process

Railway will:

1. Install dependencies: `npm install`
2. Build the app: `npm run build`
3. Start the server: `npm run preview`

The built files go to `dist/` folder and are served by Vite's preview server.
