# Production Setup Guide

## Step 1: Get a PostgreSQL Database

### Option A: Supabase (Recommended - Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Sign up for free account
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)
6. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### Option B: Neon (Free Tier)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Copy the connection string from the dashboard

### Option C: Railway (Built-in)

1. Deploy to Railway
2. Add PostgreSQL service
3. Railway provides `DATABASE_URL` automatically

## Step 2: Update Prisma Schema

1. Copy `prisma/schema.postgres.prisma` to `prisma/schema.prisma`
2. Or manually change the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

## Step 3: Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

## Step 4: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-app.vercel.app/api/auth/callback/google`
7. Copy Client ID and Client Secret

## Step 5: Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Or use an online generator: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

## Step 6: Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for production"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Framework Preset: Next.js (auto-detected)

3. **Add Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     DATABASE_URL=postgresql://...
     NEXTAUTH_URL=https://your-app.vercel.app
     NEXTAUTH_SECRET=your-generated-secret
     GOOGLE_CLIENT_ID=your-google-client-id
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

5. **Run Database Migrations**:
   - After first deployment, run:
     ```bash
     npx prisma migrate deploy
     ```
   - Or add to `package.json` scripts (already added)

## Step 7: Update Google OAuth Redirect URI

1. Go back to Google Cloud Console
2. Update authorized redirect URI to your production URL:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```

## Troubleshooting

### Database Connection Issues

- Make sure `DATABASE_URL` includes `?sslmode=require` for Supabase/Neon
- Check that your database allows connections from Vercel's IPs

### NextAuth Issues

- Ensure `NEXTAUTH_URL` matches your production domain exactly
- Check that redirect URI in Google Console matches your production URL

### Build Failures

- Make sure `prisma generate` runs before build (already in scripts)
- Check that all environment variables are set

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Google OAuth redirect URI updated
- [ ] Test login with Google
- [ ] Test data saving/loading
- [ ] Check that all features work

## Monitoring

- Vercel provides built-in analytics
- Check Vercel dashboard for errors and logs
- Set up error tracking (optional): Sentry, LogRocket, etc.

