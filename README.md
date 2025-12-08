<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Millionaires Club Fund CRM 💰

A comprehensive community fund management system with member portals, loan tracking, contribution history, and AI-powered insights powered by Google Gemini.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://mangpijasuan.github.io/Millionaires-Club-)
[![React](https://img.shields.io/badge/React-19.2.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF)](https://vitejs.dev/)

View your app in AI Studio: https://ai.studio/apps/drive/1rkhEr530dUCEoxVdwIIsWAPTygKzKVCh

## ✨ Features

### 📊 Dashboard
- Real-time fund statistics and analytics
- Member count and active loans overview
- Transaction tracking and insights
- Visual charts and graphs using Recharts

### 👥 Member Management
- Add, edit, and remove members
- Track member contributions and payments
- View detailed member profiles
- Member portal access for self-service

### 💳 Contributions Tracking
- Record yearly contributions
- Track payment status
- Historical contribution records
- Automated contribution calculations

### 💰 Loan Management
- Create and track loans
- Monitor repayment schedules
- Interest calculation
- Loan status tracking (Active, Pending, Paid, Defaulted)

### 📈 Transaction History
- Complete transaction log
- Filter by type (Contribution, Loan Payment, Loan Disbursement)
- Search and date filtering
- Export capabilities

### 📑 Reports & Analytics
- Generate comprehensive fund reports
- Member contribution summaries
- Loan portfolio analysis
- AI-powered insights using Google Gemini

### 🎨 User Experience
- Dark/Light theme toggle
- Responsive design
- Modern UI with Lucide icons
- Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Gemini API Key** (for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mangpijasuan/Millionaires-Club-.git
   cd Millionaires-Club-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Navigate to `http://localhost:5173`

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

The app will be deployed to: https://mangpijasuan.github.io/Millionaires-Club-

## 🛠️ Tech Stack

- **React 19.2.1** - UI library
- **TypeScript 5.8.2** - Type-safe JavaScript
- **Vite 6.2.0** - Build tool and dev server
- **Recharts 3.5.1** - Data visualization
- **Lucide React** - Icon library
- **Google Gemini AI** - AI-powered insights
- **LocalStorage** - Data persistence

## 📁 Project Structure

```
Millionaires-Club/
├── components/           # React components
│   ├── ContributionsComponent.tsx
│   ├── DashboardComponent.tsx
│   ├── LoansComponent.tsx
│   ├── MemberPortal.tsx
│   ├── MembersListComponent.tsx
│   ├── ReportsComponent.tsx
│   ├── ThemeToggle.tsx
│   └── TransactionHistoryComponent.tsx
├── contexts/            # React contexts
│   └── ThemeContext.tsx
├── services/            # Service layer
│   ├── apiService.ts
│   ├── geminiService.ts
│   └── storageService.ts
├── App.tsx              # Main application component
├── constants.ts         # App constants and initial data
├── types.ts             # TypeScript type definitions
├── index.tsx            # Application entry point
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies

```

## 🔑 Key Features Explained

### Data Persistence
All data is stored locally in the browser using localStorage, ensuring your data persists between sessions without requiring a backend server.

### AI-Powered Insights
The application integrates with Google's Gemini AI to provide intelligent insights on fund management, member analysis, and financial reporting.

### Responsive Design
Built with a mobile-first approach, the application works seamlessly across all device sizes.

### Theme Support
Toggle between light and dark themes for comfortable viewing in any environment.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**mangpijasuan**

- GitHub: [@mangpijasuan](https://github.com/mangpijasuan)

## 🙏 Acknowledgments

- Built with [Google AI Studio](https://ai.studio)
- Icons by [Lucide](https://lucide.dev)
- Charts by [Recharts](https://recharts.org)

---

<div align="center">
Made with ❤️ for community fund management
</div>
