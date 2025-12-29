# Setup Guide for ÉireTax Manager with Google Authentication

## Prerequisites

1. Node.js 18+ installed
2. A Google Cloud Project with OAuth credentials

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"

# Google OAuth (from Step 2)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Generate NEXTAUTH_SECRET

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Step 4: Initialize Database

```bash
npx prisma migrate dev --name init
```

This will:
- Create the SQLite database file (`dev.db`)
- Set up all the necessary tables for authentication and user data

## Step 5: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **First Visit**: Users are redirected to `/login` to sign in with Google
2. **After Login**: Users are redirected to `/dashboard` (or `/onboarding` if first time)
3. **Data Sync**: All tax data is automatically synced to the database:
   - When users make changes, data is saved to the cloud
   - When users return, their data is loaded from the cloud
   - Local storage is used as a cache/backup

## Database Schema

The app uses Prisma with SQLite and stores:
- User accounts (via NextAuth)
- Tax data (receipts, credits, etc.) linked to user IDs
- All data is encrypted and user-specific

## Production Deployment

For production:

1. Use a production database (PostgreSQL recommended):
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

2. Update `NEXTAUTH_URL` to your production domain

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

## Troubleshooting

### "Invalid credentials" error
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Verify redirect URI matches exactly in Google Cloud Console

### Database errors
- Run `npx prisma generate` to regenerate Prisma Client
- Run `npx prisma migrate dev` to apply migrations

### Data not syncing
- Check browser console for errors
- Verify user is logged in (check session)
- Check network tab for API call failures

