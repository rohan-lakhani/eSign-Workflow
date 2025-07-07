# Vercel Deployment Guide for eSign Workflow Application

This guide will help you deploy both the NestJS backend and React frontend to Vercel.

## Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. MongoDB database (use MongoDB Atlas for cloud hosting)

## Deployment Strategy

We'll deploy the backend and frontend as two separate Vercel projects for better scalability and management.

## Backend Deployment (NestJS)

### 1. Prepare the Backend

The backend is already configured with:
- `vercel.json` in the root directory
- Updated `main.ts` with Vercel support
- Proper CORS configuration

### 2. Set Environment Variables

Create these environment variables in your Vercel project:

```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/esign-workflow
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRATION=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
VERCEL=1
```

### 3. Deploy Backend

```bash
# From the root directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? esign-workflow-backend
# - Directory? ./
# - Override settings? No
```

### 4. Note Your Backend URL

After deployment, note your backend URL (e.g., `https://esign-workflow-backend.vercel.app`)

## Frontend Deployment (React/Vite)

### 1. Update Frontend Configuration

Edit `client/vercel.json` and replace the backend URL:

```json
{
  "version": 2,
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://esign-workflow-backend.vercel.app/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ]
}
```

### 2. Update API Base URL

Make sure your frontend API calls point to the correct backend. You might need to update your axios configuration or API service files.

### 3. Deploy Frontend

```bash
# From the client directory
cd client
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? esign-workflow-frontend
# - Directory? ./
# - Override settings? No
```

## Post-Deployment Configuration

### 1. Update CORS in Backend

After deploying the frontend, update the backend's environment variable:
- `FRONTEND_URL=https://your-frontend-url.vercel.app`

### 2. Update Backend main.ts

Replace `'https://your-frontend.vercel.app'` in the CORS configuration with your actual frontend URL.

### 3. Redeploy Backend

```bash
vercel --prod
```

## Important Considerations

### File Uploads

Vercel's serverless functions have limitations:
- Max payload size: 4.5MB
- Functions are stateless (files don't persist)

For production, consider using:
- AWS S3 or similar for file storage
- Cloudinary for document/image management
- Vercel Blob Storage

### MongoDB Connection

- Use connection pooling
- Set proper indexes for performance
- Consider MongoDB Atlas for managed hosting

### Environment Variables

- Never commit `.env` files
- Use different secrets for production
- Rotate JWT secrets periodically

## Monitoring and Logs

- Check Vercel dashboard for function logs
- Monitor API performance
- Set up error tracking (e.g., Sentry)

## Alternative: Monorepo Deployment

If you prefer deploying as a single project, you can use the monorepo approach with custom build commands. However, separate deployments are recommended for better scalability.

## Troubleshooting

### CORS Issues
- Ensure frontend URL is in the backend's CORS configuration
- Check that credentials are included in API requests

### 404 Errors
- Verify rewrites in vercel.json
- Check API route prefixes

### Build Failures
- Ensure all dependencies are in package.json
- Check TypeScript compilation errors
- Verify Node.js version compatibility 