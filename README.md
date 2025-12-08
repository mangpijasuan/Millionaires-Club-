# Millionaires Club Fund

A modern, cloud-based CRM application for managing a community fund with **multi-user authentication** and **real-time sync**, built with React, TypeScript, Supabase, and Google's Gemini AI.

## 🌟 Features

- **Multi-User Authentication**: Multiple admins can login from anywhere with internet
- **Cloud Database**: PostgreSQL database with automatic backups
- **Real-Time Sync**: Changes sync instantly across all devices
- **Dashboard**: Real-time overview of fund statistics and activities
- **Member Management**: Track member contributions and participation
- **Loan Management**: Monitor loan requests and repayments
- **Transaction History**: Comprehensive record of all financial activities
- **Contributions Tracking**: Detailed contribution management system
- **AI-Powered Insights**: Leveraging Google Gemini AI for intelligent analysis
- **Data Export/Import**: Backup and restore functionality
- **Secure Access**: Row-level security with role-based permissions

## 🔗 Links

**View your app in AI Studio:** [https://ai.studio/apps/drive/1rkhEr530dUCEoxVdwIIsWAPTygKzKVCh](https://ai.studio/apps/drive/1rkhEr530dUCEoxVdwIIsWAPTygKzKVCh)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Gemini API Key** from [Google AI Studio](https://ai.google.dev/)
- **Supabase Account** (free tier) from [Supabase](https://supabase.com) - **Required for multi-user access**

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd Millionaires-Club-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Create a `.env.local` file in the root directory
   - Add your API keys:
     ```env
     # Gemini AI
     GEMINI_API_KEY=your_gemini_key_here
     
     # Supabase (for multi-user & cloud sync)
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```
   - **See `QUICK_START_CHECKLIST.md` for step-by-step Supabase setup (15 min)**

4. **Setup Supabase Database** (first time only):
   - Follow `SUPABASE_SETUP.md` for complete setup
   - Quick version: Run `supabase-schema.sql` in Supabase SQL Editor

5. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   - Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📦 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini AI (@google/genai)
- **UI Components**: Lucide React (icons)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Hosting**: Netlify / Vercel (recommended)

## 📁 Project Structure

```
├── components/          # React components
│   ├── DashboardComponent.tsx
│   ├── MembersListComponent.tsx
│   ├── LoansComponent.tsx
│   ├── ContributionsComponent.tsx
│   └── TransactionHistoryComponent.tsx
├── services/           # API and external services
│   ├── geminiService.ts
│   ├── supabaseClient.ts      # Supabase configuration
│   ├── authService.ts          # Authentication
│   ├── databaseService.ts      # Database operations
│   ├── storageService.ts       # LocalStorage backup
│   └── apiService.ts           # API client
├── hooks/              # Custom React hooks
│   └── useDataPersistence.ts
├── supabase-schema.sql # Database schema
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
├── constants.ts       # Application constants
├── types.ts           # TypeScript type definitions
└── vite.config.ts     # Vite configuration
```

## 🚀 Quick Start Guides

### **For Multi-User Setup (15 minutes):**
- 📋 `QUICK_START_CHECKLIST.md` - Step-by-step checklist
- 📚 `SUPABASE_SETUP.md` - Detailed Supabase setup guide
- 🎯 `MULTI_USER_IMPLEMENTATION.md` - Implementation overview

### **For Data Management:**
- 💾 `LOCALSTORAGE_GUIDE.md` - LocalStorage usage & backup
- 📊 `DATA_PERSISTENCE_GUIDE.md` - All storage options explained

## 🔐 Authentication & Access

### **Admin Users:**
- Full access to all features
- Can manage members, loans, contributions
- Can export/import data
- Access from any device with internet

### **Member Portal:**
- View personal contribution history
- Check loan status
- Download statements

### **Setup First Admin:**
1. Create Supabase account
2. Run database setup
3. Create admin user via Supabase dashboard or app signup
4. Login and start managing!

## 👥 Multi-User Features

- ✅ Unlimited admin users
- ✅ Login from anywhere (web, mobile, tablet)
- ✅ Real-time data sync across devices
- ✅ Secure authentication with email/password
- ✅ Password reset functionality
- ✅ Session management
- ✅ Role-based access (admin, super_admin)

## 🌐 Deployment

### **Recommended Platforms:**
- **Vercel** (recommended for Next.js-style apps)
- **Netlify** (easy deployment)
- **Railway** (with backend)

### **Environment Variables for Production:**
Set these in your hosting platform:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
GEMINI_API_KEY=your_gemini_api_key
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is private and confidential.

---

Built with ❤️ using React, Supabase, and Google Gemini AI
