# ÉireTax Manager

Your Shadow Accountant - Capture every possible euro of tax relief in Ireland for 2024/2025.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with your Google account
- 📸 **Receipt Vault** - Camera scanning with OCR for medical and general receipts
- 🏠 **Rent Tax Credit** - Track rent payments and claim up to €2,000
- 🏦 **Mortgage Interest Relief** - For mortgages taken before 2013
- 🏠 **Remote Working Relief** - Track remote working days and calculate relief
- 🎟️ **Small Benefit Exemption** - Track work vouchers (€1,500 limit)
- 📚 **Lifestyle Credits** - Tuition fees, dependent relative, cycle to work, fisher tax credit
- 📊 **Money Dashboard** - See your estimated refund at a glance
- 📄 **Form 12 Helper** - Year-end filing assistance

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **NextAuth.js** - Authentication
- **Prisma** - Database ORM
- **Tesseract.js** - OCR for receipt scanning

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (for production) or SQLite (for development)
- Google OAuth credentials

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/TaxRelief.git
   cd TaxRelief
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Vercel:**
1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Your app URL | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |

## Database Schema

The app uses Prisma with the following models:
- `User` - User accounts (via NextAuth)
- `Account` - OAuth accounts
- `Session` - User sessions
- `TaxData` - User-specific tax data (JSON stored)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on GitHub.
