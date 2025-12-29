# Deployment Guide for ÉireTax Manager

## Why Not GitHub Pages?

GitHub Pages only serves static files (HTML, CSS, JS). This app requires:
- **Server-side authentication** (NextAuth.js)
- **Database** (Prisma with SQLite/PostgreSQL)
- **API routes** (`/api/user-data`, `/api/auth/[...nextauth]`)

These features need a Node.js server, which GitHub Pages doesn't provide.

## Recommended: Deploy to Vercel (Easiest)

Vercel is made by the creators of Next.js and provides the best experience.

### Prerequisites
1. GitHub account (your code should be in a GitHub repository)
2. Vercel account (free at [vercel.com](https://vercel.com))

### Steps

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/TaxRelief.git
   git push -u origin main
   ```

2. **Switch to PostgreSQL** (SQLite won't work on Vercel):
   - Update `prisma/schema.prisma` to use PostgreSQL
   - Get a free PostgreSQL database from [Supabase](https://supabase.com) or [Neon](https://neon.tech)

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js
   - Add environment variables (see below)
   - Click "Deploy"

4. **Environment Variables** (add in Vercel dashboard):
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

5. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```
   Or add this to your `package.json` scripts and Vercel will run it automatically.

### Vercel Advantages
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ Automatic deployments on git push
- ✅ Built-in CI/CD
- ✅ Edge functions support
- ✅ Easy environment variable management

---

## Alternative: Deploy to Railway (Good for Databases)

Railway is excellent for apps that need databases.

### Steps

1. **Push code to GitHub** (same as above)

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**:
   - In Railway dashboard, click "New"
   - Select "PostgreSQL"
   - Railway will provide `DATABASE_URL` automatically

4. **Configure Environment Variables**:
   - In your service settings, add:
     ```
     NEXTAUTH_URL=https://your-app.railway.app
     NEXTAUTH_SECRET=your-secret-key-here
     GOOGLE_CLIENT_ID=your-google-client-id
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     ```
   - `DATABASE_URL` is automatically set by Railway

5. **Run Migrations**:
   - Railway will run `npm run build` automatically
   - Add a post-build script to run migrations:
     ```json
     "scripts": {
       "postbuild": "prisma migrate deploy"
     }
     ```

### Railway Advantages
- ✅ Free tier ($5 credit/month)
- ✅ Built-in PostgreSQL
- ✅ Easy database management
- ✅ Automatic deployments

---

## Alternative: Deploy to Netlify (with Functions)

Netlify can work but requires more configuration.

### Steps

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Create `netlify.toml`** (see below)

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

---

## Switching from SQLite to PostgreSQL

You'll need to switch to PostgreSQL for production. Here's how:

1. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Get a PostgreSQL database**:
   - **Supabase** (recommended): [supabase.com](https://supabase.com) - Free tier available
   - **Neon**: [neon.tech](https://neon.tech) - Free tier available
   - **Railway**: Built-in PostgreSQL

3. **Update your `.env`**:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   ```

4. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

---

## Environment Variables Checklist

Make sure you have these set in your production environment:

- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
- ✅ `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- ✅ `GOOGLE_CLIENT_ID` - From Google Cloud Console
- ✅ `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

**Important**: Update your Google OAuth redirect URI to:
- `https://your-app.vercel.app/api/auth/callback/google`

---

## Quick Start: Vercel Deployment

1. **Create GitHub repo** and push code
2. **Get PostgreSQL database** from Supabase
3. **Go to vercel.com** → Import Project → Select repo
4. **Add environment variables** in Vercel dashboard
5. **Deploy!**

That's it! Your app will be live at `https://your-app.vercel.app`

