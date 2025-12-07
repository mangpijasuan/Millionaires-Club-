# Millionaires Club Fund CRM

A modern, AI-powered CRM application for managing a community fund, built with React, TypeScript, and Google's Gemini AI.

## 🌟 Features

- **Dashboard**: Real-time overview of fund statistics and activities
- **Member Management**: Track member contributions and participation
- **Loan Management**: Monitor loan requests and repayments
- **Transaction History**: Comprehensive record of all financial activities
- **Contributions Tracking**: Detailed contribution management system
- **AI-Powered Insights**: Leveraging Google Gemini AI for intelligent analysis

## 🔗 Links

**View your app in AI Studio:** [https://ai.studio/apps/drive/1rkhEr530dUCEoxVdwIIsWAPTygKzKVCh](https://ai.studio/apps/drive/1rkhEr530dUCEoxVdwIIsWAPTygKzKVCh)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Gemini API Key** from [Google AI Studio](https://ai.google.dev/)

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
   - Add your Gemini API key:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

4. **Run the development server**:
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
- **AI Integration**: Google Gemini AI (@google/genai)
- **UI Components**: Lucide React (icons)
- **Charts**: Recharts
- **Styling**: CSS

## 📁 Project Structure

```
├── components/          # React components
│   ├── DashboardComponent.tsx
│   ├── MembersListComponent.tsx
│   ├── LoansComponent.tsx
│   ├── ContributionsComponent.tsx
│   └── TransactionHistoryComponent.tsx
├── services/           # API and external services
│   └── geminiService.ts
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
├── constants.ts       # Application constants
├── types.ts           # TypeScript type definitions
└── vite.config.ts     # Vite configuration

```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is private and confidential.

---

Built with ❤️ using React and Google Gemini AI
