/**
 * =============================================================================
 * App.tsx - Main Application Component for Millionaires Club Financial Services
 * =============================================================================
 * 
 * This is the root component of the Millionaires Club CRM application, a financial
 * services platform designed to manage member contributions, loans, and financial
 * reporting for a community-based investment club.
 * 
 * KEY BUSINESS CONCEPTS:
 * - Members contribute monthly funds to a shared pool (typically $20/month)
 * - Members can borrow from the pool (up to 4x their contribution, max $5,000)
 * - Loans require a cosigner who assumes liability if borrower defaults
 * - A 3-month "cool-off" period is enforced after paying off a loan
 * - Application fees are tiered based on loan amount and term length
 * 
 * ARCHITECTURE OVERVIEW:
 * - State is persisted to localStorage for offline-first capability
 * - AI-powered insights via Google Gemini API for member risk assessment
 * - Dual portal system: Admin workspace + Member self-service portal
 * - Automation engine for renewal reminders and scheduled notifications
 * 
 * DATA FLOW:
 * 1. Members are loaded from constants.ts (seeded data) or localStorage (persisted)
 * 2. All state changes trigger localStorage sync via useEffect hooks
 * 3. Transactions log all financial activities for audit trail
 * 4. Communication logs track all member-admin interactions
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, LayoutDashboard, Plus, FileText, CheckCircle, AlertCircle,
  Calendar, Wallet, ArrowRightLeft, X, UserCheck, Edit2, Trash2,
  Search, Filter, Save, ChevronRight, Download, Upload, PieChart,
  TrendingUp, BarChart3, Clock, Settings, Shield, LogOut, Bell,
  Activity, Sparkles, Loader, Lock, Key, Heart, Printer, Calculator, Menu,
  ShieldCheck, ArrowRight
} from 'lucide-react';
import { Member, Loan, Transaction, CommunicationLog, YearlyContribution } from './types';
import { CONTRIBUTIONS_DB, INITIAL_MEMBERS, CONTRIBUTION_HISTORY_DB } from './constants';
import { callGemini } from './services/geminiService';

// Sub-components for modular UI organization
import DashboardComponent from './components/DashboardComponent';
import MembersListComponent from './components/MembersListComponent';
import ContributionsComponent from './components/ContributionsComponent';
import LoansComponent from './components/LoansComponent';
import TransactionHistoryComponent from './components/TransactionHistoryComponent';

// =============================================================================
// UTILITY FUNCTIONS
// These helper functions provide consistent formatting and calculations
// used throughout the application for data presentation and business logic
// =============================================================================

/**
 * Generates a random alphanumeric ID for entities (loans, transactions, etc.)
 * Uses base-36 encoding for compact, URL-safe identifiers
 */
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Formats a number as USD currency with proper locale formatting
 * Example: 1234.56 -> "$1,234.56"
 */
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

/**
 * Formats an ISO date string for display (e.g., "Dec 5, 2024")
 * Returns '-' for empty/null dates to prevent rendering errors
 */
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Formats an ISO date string with time for activity logs
 * Example: "Dec 5, 10:30 AM"
 */
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Calculates the number of months between two dates
 * Used for determining loan cool-off period eligibility
 * @param d1 - Start date as ISO string (e.g., last loan payoff date)
 * @param d2 - End date as Date object (typically current date)
 * @returns Number of months between the two dates
 */
const getMonthDiff = (d1: string, d2: Date) => {
  const date1 = new Date(d1);
  return (d2.getFullYear() - date1.getFullYear()) * 12 + (d2.getMonth() - date1.getMonth());
};

/**
 * NavItem Component - Sidebar navigation button with active state styling
 * Provides consistent navigation experience in the admin dashboard sidebar
 * Active tab is highlighted with emerald accent color and glow effect
 */
const NavItem = ({ id, icon, label, activeTab, setActiveTab }: any) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      activeTab === id 
        ? 'bg-emerald-500/10 text-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.15)] border border-emerald-500/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium'
    }`}
  >
    {icon}
    <span className="text-sm tracking-wide">{label}</span>
  </button>
);

// =============================================================================
// LANDING AND AUTHENTICATION PAGES
// These components handle the initial user experience and authentication flow
// for both administrators and members accessing the system
// =============================================================================

/**
 * LandingPage Component - Initial entry point for the application
 * 
 * PURPOSE: Provides role-based navigation to either the Admin Workspace or 
 * Member Portal, establishing clear separation of concerns between fund 
 * managers and individual contributors.
 * 
 * WHY TWO PORTALS:
 * - Admin Workspace: Full CRUD operations on all data, loan approvals, 
 *   contribution recording, and financial reporting capabilities
 * - Member Portal: Read-only self-service for members to view their own 
 *   contribution history, loan status, and account information
 */
const LandingPage = ({ setViewMode }: { setViewMode: (mode: any) => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mb-8 shadow-2xl">
              <div className="p-3 bg-emerald-500 rounded-xl mr-4 text-white shadow-lg shadow-emerald-500/20">
                  <Users size={32} />
              </div>
              <div className="text-left">
                  <h1 className="text-3xl font-bold text-white tracking-tight">Millionaires Club</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Financial Services</p>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/60 font-mono">v2.0</span>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Admin Card */}
              <div 
                  onClick={() => setViewMode('admin_login')}
                  className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 p-8 rounded-3xl cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20 text-left relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutDashboard size={120} />
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Admin Workspace</h2>
                  <p className="text-slate-400 mb-6 text-sm leading-relaxed">Manage members, track loans, record contributions, and generate financial reports.</p>
                  <div className="flex items-center text-emerald-400 font-bold text-sm group-hover:text-white transition-colors">
                      Enter Workspace <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
              </div>

              {/* Member Card */}
              <div 
                  onClick={() => setViewMode('member_login')}
                  className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-blue-500/50 p-8 rounded-3xl cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20 text-left relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Users size={120} />
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <UserCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Member Portal</h2>
                  <p className="text-slate-400 mb-6 text-sm leading-relaxed">View your personal contribution history, check loan status, and download statements.</p>
                  <div className="flex items-center text-blue-400 font-bold text-sm group-hover:text-white transition-colors">
                      Access Portal <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
              </div>
          </div>

          <div className="mt-12 text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} Millionaires Club Financial Services. All rights reserved.
          </div>
      </div>
  </div>
);

/**
 * AdminLoginPage Component - Secure entry point for fund administrators
 * 
 * AUTHENTICATION FLOW:
 * 1. Admin navigates to this page from the landing page
 * 2. Enters credentials (email/password) - currently demo mode accepts any input
 * 3. On success, redirected to full admin dashboard with all management capabilities
 * 
 * SECURITY NOTE: In production, this would integrate with a proper authentication
 * backend (e.g., Firebase Auth, Auth0) to validate credentials and issue tokens.
 * The current implementation is for demonstration purposes only.
 */
const AdminLoginPage = ({ onLogin, setViewMode }: { onLogin: (e: React.FormEvent) => void, setViewMode: (mode: any) => void }) => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in-95">
          <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-slate-100 text-slate-700 rounded-full mb-4">
                  <LayoutDashboard size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Admin Workspace</h2>
              <p className="text-slate-500 text-sm mt-2">Secure access for fund managers.</p>
          </div>

          <form onSubmit={onLogin} className="space-y-5">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <div className="relative">
                      <Shield className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input 
                        type="email"
                        defaultValue="admin@millionairesclub.com"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none" 
                        required 
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                  <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input 
                        type="password"
                        defaultValue="password"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none" 
                        required 
                      />
                  </div>
              </div>
              <button type="submit" className="w-full bg-slate-800 text-white py-3.5 rounded-lg font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 mt-2">
                  Enter Workspace <ArrowRight size={16} />
              </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <button onClick={() => setViewMode('landing')} className="text-xs text-slate-400 hover:text-slate-600 underline">
                  Back to Home
              </button>
          </div>
      </div>
  </div>
);

/**
 * MemberLoginScreen Component - Self-service portal authentication
 * 
 * AUTHENTICATION FLOW:
 * 1. Member enters their unique Member ID (e.g., "MC-000001")
 * 2. System validates the ID exists in the members database
 * 3. If valid, member is granted read-only access to their personal data
 * 4. If invalid, an error message is displayed prompting admin contact
 * 
 * WHY MEMBER ID ONLY (NO PASSWORD):
 * - Simplified access for community members who may not be tech-savvy
 * - Member IDs are shared only with the member during enrollment
 * - Portal is read-only, minimizing security risk of data exposure
 * - In production, could be enhanced with OTP/SMS verification
 */
const MemberLoginScreen = ({ onLogin, loginError, setViewMode }: { onLogin: (e: React.FormEvent) => void, loginError: string, setViewMode: (mode: any) => void }) => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in-95">
          <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                  <Users size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Member Portal</h2>
              <p className="text-slate-500 text-sm mt-2">Access your fund records securely.</p>
          </div>

          {loginError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} /> {loginError}
              </div>
          )}

          <form onSubmit={onLogin} className="space-y-5">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Member ID</label>
                  <div className="relative">
                      <UserCheck className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input 
                        name="memberId" 
                        placeholder="e.g. MC-000001" 
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        required 
                      />
                  </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2">
                  Access Portal <ArrowRight size={16} />
              </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <button onClick={() => setViewMode('landing')} className="text-xs text-slate-400 hover:text-slate-600 underline">
                  Back to Home
              </button>
          </div>
      </div>
  </div>
);

/**
 * =============================================================================
 * App Component - Main Application Controller
 * =============================================================================
 * 
 * This is the primary component that orchestrates the entire application state,
 * business logic, and routing between different views. It manages:
 * 
 * 1. APPLICATION STATE - All core data entities (members, loans, transactions)
 * 2. VIEW ROUTING - Navigation between landing, login, portal, and dashboard
 * 3. BUSINESS LOGIC - Eligibility checks, loan calculations, notifications
 * 4. DATA PERSISTENCE - localStorage sync for offline-first capability
 * 5. AUTOMATION - Scheduled tasks for renewals and notifications
 */
export default function App() {
  // ==========================================================================
  // VIEW ROUTING STATE
  // Controls which major view/page is currently displayed to the user
  // ==========================================================================
  
  /**
   * viewMode: Controls the current application view
   * - 'landing': Initial role selection page (Admin vs Member)
   * - 'admin_login': Admin authentication form
   * - 'admin_dashboard': Full admin workspace with all management features
   * - 'member_login': Member ID verification form
   * - 'member_portal': Read-only member self-service portal
   */
  const [viewMode, setViewMode] = useState<'landing' | 'admin_login' | 'admin_dashboard' | 'member_login' | 'member_portal'>('landing');
  
  /**
   * activeTab: Current navigation tab in the admin dashboard
   * Controls which sub-component is rendered in the main content area
   */
  const [activeTab, setActiveTab] = useState('dashboard');
  
  /**
   * notifications: Toast notification queue for user feedback
   * Each notification has id (for key/removal), message, and type (success/error/info)
   * Notifications auto-dismiss after 3 seconds via setTimeout
   */
  const [notifications, setNotifications] = useState<{id: number, message: string, type: 'success' | 'error' | 'info'}[]>([]);
  
  /**
   * editingMember: Currently selected member for detail view/editing
   * When set, opens the MemberDetailPane slide-out panel
   */
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  /**
   * currentMemberUser: Authenticated member for the self-service portal
   * Set after successful member login, used to display personalized data
   */
  const [currentMemberUser, setCurrentMemberUser] = useState<Member | null>(null);
  
  /**
   * UI state for modals and responsive design
   */
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ==========================================================================
  // CORE DATA STATE - Primary Business Entities
  // Each state is initialized from localStorage (if available) or seed data
  // This enables offline-first operation and data persistence across sessions
  // ==========================================================================
  
  /**
   * members: Array of all club members with their profile and financial data
   * 
   * BUSINESS CONTEXT:
   * - Each member has a unique MC-XXXXXX ID assigned at enrollment
   * - Members can be Active (contributing) or Inactive (suspended/departed)
   * - totalContribution tracks lifetime accumulated savings
   * - activeLoanId links to current outstanding loan (if any)
   * - lastLoanPaidDate used for cool-off period calculation
   * 
   * INITIALIZATION:
   * 1. First checks localStorage for previously saved data
   * 2. Falls back to INITIAL_MEMBERS from constants.ts (seed data from ledger)
   */
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('mpm_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  /**
   * loans: Array of all loan records (active, paid, or defaulted)
   * 
   * BUSINESS CONTEXT:
   * - Loans are issued from the pooled contribution funds
   * - Each loan requires a borrower and a cosigner (joint liability)
   * - remainingBalance decreases as payments are made
   * - nextPaymentDue is always the 10th of the following month
   * - Loans can have 12 or 24 month terms
   * 
   * STATUS LIFECYCLE:
   * 'ACTIVE' -> 'PAID' (when remainingBalance reaches 0)
   * 'ACTIVE' -> 'DEFAULTED' (manual admin action for delinquent loans)
   */
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('mpm_loans');
    return saved ? JSON.parse(saved) : [];
  });

  /**
   * transactions: Immutable ledger of all financial activities
   * 
   * BUSINESS CONTEXT:
   * This serves as the audit trail for all money movement in the system.
   * Transactions are never deleted or modified - only new records are added.
   * 
   * TRANSACTION TYPES:
   * - CONTRIBUTION: Member deposits monthly savings
   * - LOAN_DISBURSAL: Fund release to borrower
   * - LOAN_REPAYMENT: Payment against outstanding loan
   * - FEE: Application fees, late fees, or other charges
   * 
   * Each transaction captures: who, what, when, how (payment method), 
   * and by whom (receivedBy) for complete audit capability
   */
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('mpm_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  /**
   * communicationLogs: Record of all admin-member communications
   * 
   * BUSINESS CONTEXT:
   * Tracks all interactions for member service history:
   * - System-generated notifications (renewal reminders, payment confirmations)
   * - Admin notes about member accounts or conversations
   * - Email/SMS logs from automated outreach campaigns
   * 
   * WHY THIS MATTERS:
   * - Ensures continuity when different admins handle the same member
   * - Provides evidence for dispute resolution
   * - Enables analysis of communication effectiveness
   */
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(() => {
      const saved = localStorage.getItem('mpm_comms');
      return saved ? JSON.parse(saved) : [
          { id: 'c1', memberId: 'MC-000001', type: 'System', content: 'Renewal Reminder Sent (30 Days)', date: '2025-11-25T10:00:00', direction: 'Outbound' }
      ];
  });

  /**
   * contributionHistory: Year-by-year contribution breakdown per member
   * 
   * BUSINESS CONTEXT:
   * While totalContribution on Member gives the lifetime sum, this provides
   * granular yearly data for:
   * - Historical reporting and trend analysis
   * - Member statements showing year-over-year growth
   * - Verification against original paper ledgers
   * 
   * STRUCTURE: { memberId: { year: amount, ... }, ... }
   * Example: { 'MC-000001': { 2024: 240, 2023: 240, 2022: 240 } }
   */
  const [contributionHistory, setContributionHistory] = useState<Record<string, YearlyContribution>>(() => {
      const saved = localStorage.getItem('mpm_history');
      return saved ? JSON.parse(saved) : CONTRIBUTION_HISTORY_DB;
  });

  // ==========================================================================
  // DATA PERSISTENCE EFFECTS
  // These useEffect hooks sync state to localStorage whenever data changes
  // This ensures data survives page refreshes and browser sessions
  // ==========================================================================
  
  useEffect(() => { localStorage.setItem('mpm_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('mpm_loans', JSON.stringify(loans)); }, [loans]);
  useEffect(() => { localStorage.setItem('mpm_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('mpm_comms', JSON.stringify(communicationLogs)); }, [communicationLogs]);
  useEffect(() => { localStorage.setItem('mpm_history', JSON.stringify(contributionHistory)); }, [contributionHistory]);

  // ==========================================================================
  // NOTIFICATION SYSTEM
  // Provides user feedback through toast notifications that auto-dismiss
  // ==========================================================================
  
  /**
   * notify: Displays a temporary toast notification to the user
   * 
   * @param message - Text to display in the notification
   * @param type - Visual style: 'success' (green), 'error' (red), 'info' (neutral)
   * 
   * WHY AUTO-DISMISS:
   * - Reduces cognitive load by not requiring manual dismissal
   * - 3 seconds is long enough to read, short enough to not annoy
   * - Stack multiple notifications for batch operations
   */
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // ==========================================================================
  // LOAN ELIGIBILITY LOGIC
  // Core business rules that determine who can borrow and how much
  // ==========================================================================

  /**
   * calculateLoanLimit: Determines maximum loan amount for a member
   * 
   * BUSINESS RULE:
   * - Members can borrow up to 4x their total contribution
   * - Maximum loan is capped at $5,000 regardless of contribution
   * 
   * WHY 4X CONTRIBUTION:
   * - Ensures loans are backed by member's "equity" in the fund
   * - Provides incentive for consistent contributions
   * - Limits risk exposure per member proportionally
   * 
   * @param member - Member to calculate limit for
   * @returns Maximum loan amount in dollars
   */
  const calculateLoanLimit = (member: Member) => {
    const fourTimeContribution = member.totalContribution * 4;
    return Math.min(fourTimeContribution, 5000);
  };

  /**
   * checkEligibility: Comprehensive loan eligibility verification
   * 
   * ELIGIBILITY REQUIREMENTS (ALL must pass):
   * 1. Member account must be Active (not suspended or departed)
   * 2. No existing active loan (one loan at a time policy)
   * 3. Must have positive contribution balance (no borrowing on day 1)
   * 4. Cannot be a cosigner on another active loan (limits cascading defaults)
   * 5. Must wait 3 months after paying off previous loan (cool-off period)
   * 
   * WHY COOL-OFF PERIOD:
   * - Prevents continuous borrowing cycles that deplete the fund
   * - Encourages members to rebuild savings before re-borrowing
   * - Reduces administrative overhead of rapid loan turnover
   * 
   * WHY COSIGNER RESTRICTION:
   * - If a cosigner has their own loan and defaults, both loans are at risk
   * - Prevents one member from being liable for multiple loans simultaneously
   * 
   * @param memberId - ID of member to check
   * @returns Object with eligible boolean, reason (if ineligible), limit (if eligible)
   */
  const checkEligibility = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return { eligible: false, reason: 'Member not found' };
    
    if (member.accountStatus === 'Inactive') return { eligible: false, reason: 'Inactive account' };
    if (member.activeLoanId) return { eligible: false, reason: 'Active loan exists' };
    if (member.totalContribution <= 0) return { eligible: false, reason: 'No contributions' };

    // Check if member is a cosigner on an existing ACTIVE loan
    // This prevents cascading default risk across multiple loans
    const isActiveCosigner = loans.some(l => l.cosignerId === memberId && l.status === 'ACTIVE');
    if (isActiveCosigner) {
      return { eligible: false, reason: 'Active cosigner on another loan' };
    }

    // Enforce 3-month cool-off period after loan payoff
    // This encourages saving behavior and prevents rapid re-borrowing
    if (member.lastLoanPaidDate) {
      const monthsSincePaid = getMonthDiff(member.lastLoanPaidDate, new Date());
      if (monthsSincePaid < 3) {
        return { eligible: false, reason: `Cool-off (${3 - monthsSincePaid} mo. left)` };
      }
    }
    return { eligible: true, limit: calculateLoanLimit(member) };
  };

  // ==========================================================================
  // MEMBER MANAGEMENT HANDLERS
  // Functions for creating, updating, and batch-importing members
  // ==========================================================================

  /**
   * handleAddMember: Creates a new member from the enrollment form
   * 
   * WORKFLOW:
   * 1. Extracts form data from the submission event
   * 2. Generates a new member object with default initial values
   * 3. Validates Member ID uniqueness (prevents duplicate entries)
   * 4. Adds to members array (triggers localStorage sync via useEffect)
   * 5. Resets the form for the next entry
   * 
   * INITIAL VALUES:
   * - accountStatus: 'Active' (new members start active)
   * - totalContribution: 0 (no contributions yet)
   * - activeLoanId: null (no active loan)
   * - lastLoanPaidDate: null (no loan history)
   */
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newMember: Member = {
      id: (formData.get('mc_id') as string) || generateId(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      joinDate: new Date().toISOString().split('T')[0],
      accountStatus: 'Active',
      totalContribution: 0,
      activeLoanId: null,
      lastLoanPaidDate: null,
      phone: (formData.get('phone') as string) || '',
      address: (formData.get('address') as string) || '',
      beneficiary: (formData.get('beneficiary') as string) || ''
    };
    
    // Prevent duplicate Member IDs which would cause data conflicts
    if (members.some(m => m.id === newMember.id)) {
        notify('Member ID already exists!', 'error');
        return;
    }

    setMembers([...members, newMember]);
    notify(`Member ${newMember.name} added successfully!`);
    (e.target as HTMLFormElement).reset();
  };

  /**
   * handleBatchUpload: Imports multiple members from CSV data
   * 
   * PURPOSE:
   * Enables bulk member import during initial system setup or when
   * migrating from paper/spreadsheet records to the digital system.
   * 
   * CSV FORMAT EXPECTED:
   * Name,MemberID,Email,JoinDate
   * Example: "John Doe,MC-000123,john@example.com,2024-01-15"
   * 
   * VALIDATION:
   * - Skips rows where Member ID already exists (prevents duplicates)
   * - Skips rows with missing required fields (name, id)
   * - Reports count of successfully added members
   * 
   * @param csvText - Raw CSV string from the batch upload textarea
   */
  const handleBatchUpload = (csvText: string) => {
      const lines = csvText.trim().split('\n');
      let addedCount = 0;
      const newMembers: Member[] = [];

      lines.forEach(line => {
          const [name, id, email, joinDate] = line.split(',').map(s => s.trim());
          // Only add if name and id exist, and id is not already in system
          if (name && id && !members.some(m => m.id === id)) {
              newMembers.push({
                  id, name, email: email || '',
                  joinDate: joinDate || new Date().toISOString().split('T')[0],
                  accountStatus: 'Active', totalContribution: 0,
                  activeLoanId: null, lastLoanPaidDate: null,
                  phone: '', address: '', beneficiary: ''
              });
              addedCount++;
          }
      });

      if (addedCount > 0) {
          setMembers([...members, ...newMembers]);
          notify(`Batch upload successful! Added ${addedCount} members.`);
          setShowBatchUpload(false);
      } else {
          notify('No valid new members found in CSV data.', 'error');
      }
  };

  // ==========================================================================
  // AUTOMATION ENGINE
  // Scheduled tasks for renewal reminders and automated notifications
  // ==========================================================================

  /**
   * handleRunAutomation: Executes the daily automation job manually
   * 
   * BUSINESS CONTEXT:
   * The club has annual membership renewals. This automation:
   * 1. Identifies members whose join date month is approaching
   * 2. Generates renewal reminder notifications
   * 3. Logs the outreach in communicationLogs for tracking
   * 
   * WHY MANUAL TRIGGER (vs cron):
   * - Browser-based app cannot run scheduled tasks when closed
   * - Admin can run "nightly" job at convenient time
   * - In production, this would be a server-side cron job
   * 
   * CURRENT LOGIC:
   * - Checks for members whose joinDate month is December
   * - Simulates SendGrid email notification being sent
   * - Logs the communication for each affected member
   */
  const handleRunAutomation = () => {
      notify('Starting Daily Automation Jobs...', 'info');
      setTimeout(() => {
        let updates = 0;
        const newLogs: CommunicationLog[] = [];
        members.forEach(m => {
             // Simple heuristic: members joined in December need renewal reminders
             // In production, this would check actual renewal date calculations
             if (m.accountStatus === 'Active' && m.joinDate.includes('-12-')) {
                 newLogs.push({
                     id: generateId(), memberId: m.id, type: 'System', direction: 'Outbound',
                     content: 'Auto-Renewal: 30-day reminder email sent via SendGrid.',
                     date: new Date().toISOString()
                 });
                 updates++;
             }
        });
        if (updates > 0) {
            setCommunicationLogs([...newLogs, ...communicationLogs]);
            notify(`Automation Complete: Sent ${updates} renewal reminders.`);
        } else {
            notify('Automation Complete: No actions required today.');
        }
      }, 1500); // Simulated delay for visual feedback
  };

  /**
   * handleAddNote: Records an admin note on a member's account
   * 
   * PURPOSE:
   * Allows admins to document conversations, special circumstances,
   * or important information about a member for future reference.
   * 
   * @param memberId - Member to attach the note to
   * @param content - Text content of the note
   */
  const handleAddNote = (memberId: string, content: string) => {
      const newLog: CommunicationLog = {
          id: generateId(), memberId, type: 'Note', direction: 'Inbound',
          content, date: new Date().toISOString(), adminId: 'Admin'
      };
      setCommunicationLogs([newLog, ...communicationLogs]);
  };

  /**
   * handleAdminUpdateMember: Updates member profile information
   * 
   * WORKFLOW:
   * 1. Extracts updated fields from the edit form
   * 2. Merges updates with existing member data
   * 3. Updates both the members array and the currently editing member
   * 4. Preserves financial data (contributions, loans) that aren't editable here
   */
  const handleAdminUpdateMember = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      if(!editingMember) return;
      const updates = {
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          address: formData.get('address') as string,
          beneficiary: formData.get('beneficiary') as string,
          accountStatus: formData.get('accountStatus') as 'Active' | 'Inactive'
      };

      setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...updates } : m));
      setEditingMember({ ...editingMember, ...updates });
      notify('Member profile updated.');
  };

  // ==========================================================================
  // AUTHENTICATION HANDLERS
  // Functions that process login attempts for admins and members
  // ==========================================================================
  
  /**
   * loginError: Error message displayed on failed member login
   * Cleared on successful login, set when member ID not found
   */
  const [loginError, setLoginError] = useState('');
  
  /**
   * handleMemberLogin: Processes member portal login attempt
   * 
   * AUTHENTICATION FLOW:
   * 1. Extract Member ID from form submission
   * 2. Search members array for matching ID
   * 3. If found: clear errors, set currentMemberUser, navigate to portal
   * 4. If not found: display error message, stay on login screen
   * 
   * SECURITY CONSIDERATION:
   * This is a simple ID-based lookup without password verification.
   * Suitable for read-only portal access where risk is limited.
   * Production systems should add additional verification (OTP, etc.)
   */
  const handleMemberLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const memberId = (formData.get('memberId') as string).trim();
      
      const member = members.find(m => m.id === memberId);
      
      if (!member) {
          setLoginError('Member ID not found. Please contact admin.');
          return;
      }
      
      setLoginError('');
      setCurrentMemberUser(member);
      setViewMode('member_portal');
      notify(`Welcome back, ${member.name}`);
  };

  /**
   * handleAdminLogin: Processes admin workspace login attempt
   * 
   * CURRENT IMPLEMENTATION:
   * Demo mode - accepts any credentials to allow testing.
   * 
   * PRODUCTION REQUIREMENTS:
   * - Validate credentials against secure backend
   * - Issue JWT or session token
   * - Implement password hashing and secure storage
   * - Add rate limiting to prevent brute force attacks
   * - Implement MFA for sensitive operations
   */
  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Demo mode: accept any credentials for demonstration purposes
      // In production, this would validate against a secure authentication backend
      notify('Access Granted. Welcome to Workspace.');
      setViewMode('admin_dashboard');
  };

  // ==========================================================================
  // MEMBER DETAIL PANE
  // Slide-out panel for viewing/editing individual member details
  // Includes AI-powered analysis and financial history management
  // ==========================================================================

  /**
   * MemberDetailPane: Comprehensive member view/edit panel
   * 
   * PURPOSE:
   * Provides a focused view of a single member with:
   * - Profile information (name, contact, beneficiary)
   * - Financial overview (contributions, loan status)
   * - AI-powered risk assessment for loan eligibility
   * - Editable yearly contribution history (for corrections/imports)
   * - Monthly breakdown calculator for detailed entry
   * 
   * AI INTEGRATION:
   * Uses Google Gemini to analyze member data and provide insights:
   * - Risk assessment for potential loan applications
   * - Contribution pattern analysis
   * - Personalized recommendations
   * 
   * FINANCIAL HISTORY CRUD:
   * Allows admins to modify historical contribution data for:
   * - Correcting data entry errors
   * - Importing historical records from paper ledgers
   * - Adding missing years during data migration
   * Member's totalContribution is recalculated on save
   */
  const MemberDetailPane = () => {
      if (!editingMember) return null;
      const [detailTab, setDetailTab] = useState<'overview' | 'financial' | 'timeline'>('overview');
      const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [isEditingProfile, setIsEditingProfile] = useState(false);
      
      // Financial CRUD State - temporary state while editing before save
      const [isEditingFinancials, setIsEditingFinancials] = useState(false);
      const [tempHistory, setTempHistory] = useState<YearlyContribution>({});
      const [newYearInput, setNewYearInput] = useState('');
      const [newAmountInput, setNewAmountInput] = useState('');

      // Monthly Editing State - for breaking down yearly totals by month
      const [monthlyEditorTarget, setMonthlyEditorTarget] = useState<number | null>(null);
      const [monthlyValues, setMonthlyValues] = useState<number[]>(Array(12).fill(0));

      // Get historical data: use state as source of truth, fallback to empty
      const displayHistory = contributionHistory[editingMember.id] || {};
      const sortedYears = Object.keys(displayHistory).map(Number).sort((a,b) => b-a);

      /**
       * handleAnalyzeMember: Triggers AI analysis of the member
       * 
       * WHAT IT ANALYZES:
       * - Member tenure and engagement level
       * - Contribution consistency and total
       * - Loan risk assessment based on financial profile
       * 
       * WHY AI HERE:
       * - Provides objective, data-driven insights
       * - Helps admins make informed lending decisions
       * - Reduces manual analysis effort
       */
      const handleAnalyzeMember = async () => {
          setIsAnalyzing(true);
          const prompt = `Analyze this member: ${editingMember.name}, Join Date: ${editingMember.joinDate}, Contribution: $${editingMember.totalContribution}. Status: ${editingMember.accountStatus}. Provide a brief risk assessment for a loan eligibility check (Max loan is 4x contribution).`;
          const result = await callGemini(prompt);
          setAiAnalysis(result);
          setIsAnalyzing(false);
      };

      // ========================================================================
      // Financial History CRUD Operations
      // These functions manage the editing workflow for contribution history
      // ========================================================================

      /**
       * Enters edit mode for financial history
       * Creates a copy of current history for temporary editing
       */
      const handleStartEditFinancials = () => {
          setTempHistory({ ...displayHistory });
          setIsEditingFinancials(true);
      };

      /**
       * Cancels editing and discards all unsaved changes
       */
      const handleCancelEditFinancials = () => {
          setIsEditingFinancials(false);
          setTempHistory({});
          setNewYearInput('');
          setNewAmountInput('');
          setMonthlyEditorTarget(null);
      };

      /**
       * Saves financial history changes and recalculates member total
       * 
       * IMPORTANT:
       * This recalculates totalContribution from the yearly history,
       * ensuring consistency between detail records and the summary.
       */
      const handleSaveFinancials = () => {
          // Sum all yearly contributions to get new total
          const newTotal = Object.values(tempHistory).reduce((sum: number, val: number) => sum + val, 0);
          
          // Update the contribution history state
          setContributionHistory(prev => ({
              ...prev,
              [editingMember.id]: tempHistory
          }));

          // Sync the member's totalContribution with the calculated sum
          const updatedMember = { ...editingMember, totalContribution: newTotal };
          setMembers(prev => prev.map(m => m.id === editingMember.id ? updatedMember : m));
          setEditingMember(updatedMember);
          
          setIsEditingFinancials(false);
          notify('Financial history updated and member total recalculated.');
      };

      /**
       * Removes a year from the temporary history (unsaved until Save)
       */
      const handleDeleteYear = (year: number) => {
          const next = { ...tempHistory };
          delete next[year];
          setTempHistory(next);
      };

      /**
       * Adds a new year to the temporary history
       * Validates for duplicate years and valid numeric input
       */
      const handleAddYear = () => {
          const year = parseInt(newYearInput);
          const amount = parseFloat(newAmountInput);
          
          if (!year || isNaN(amount)) {
              notify('Invalid year or amount', 'error');
              return;
          }
          if (tempHistory[year]) {
              notify(`Year ${year} already exists`, 'error');
              return;
          }
          
          setTempHistory({ ...tempHistory, [year]: amount });
          setNewYearInput('');
          setNewAmountInput('');
      };

      // ========================================================================
      // Monthly Editor - Calculator for breaking down yearly totals
      // Useful when importing from records that have monthly detail
      // ========================================================================

      /**
       * Opens the monthly breakdown editor for a specific year
       * @param year - The year to edit (or 'new' for the add year form)
       * @param currentTotal - Existing total for reference (unused, for future use)
       */
      const openMonthlyEditor = (year: number | 'new', currentTotal: number) => {
          setMonthlyValues(Array(12).fill(0)); 
          setMonthlyEditorTarget(year === 'new' ? -1 : year);
      };

      /**
       * Updates a single month's value in the monthly editor
       */
      const handleMonthlyChange = (index: number, val: string) => {
          const newVals = [...monthlyValues];
          newVals[index] = parseFloat(val) || 0;
          setMonthlyValues(newVals);
      };

      /**
       * Applies the monthly sum to either the new year form or an existing year
       * Calculates total from 12 monthly values and updates accordingly
       */
      const saveMonthlyEditor = () => {
          const sum = monthlyValues.reduce((a, b) => a + b, 0);
          if (monthlyEditorTarget === -1) {
              // Applying to the "new year" input field
              setNewAmountInput(sum.toFixed(2));
          } else if (monthlyEditorTarget !== null) {
              // Applying to an existing year in tempHistory
              setTempHistory({ ...tempHistory, [monthlyEditorTarget]: sum });
          }
          setMonthlyEditorTarget(null);
      };

      /**
       * MonthlyEditor: Inline component for entering 12 monthly values
       * Shows a grid of month inputs with running sum calculation
       */
      const MonthlyEditor = () => (
          <div className="bg-slate-100 p-3 rounded-lg mt-2 mb-2 border border-slate-200">
              <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Monthly Breakdown Calculator</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                      <div key={m}>
                          <label className="text-[9px] text-slate-400 block">{m}</label>
                          <input 
                              type="number" 
                              className="w-full p-1 text-xs border border-slate-300 rounded"
                              value={monthlyValues[i] || ''}
                              onChange={(e) => handleMonthlyChange(i, e.target.value)}
                              placeholder="0"
                          />
                      </div>
                  ))}
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-xs font-bold text-slate-700">Sum: <span className="text-emerald-600">${monthlyValues.reduce((a,b)=>a+b,0).toFixed(2)}</span></span>
                  <div className="flex gap-2">
                      <button onClick={() => setMonthlyEditorTarget(null)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                      <button onClick={saveMonthlyEditor} className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700">Apply Sum</button>
                  </div>
              </div>
          </div>
      );

      return (
        <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/30 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                              {editingMember.name} 
                              <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="p-1 hover:bg-slate-200 rounded"><Edit2 size={16}/></button>
                           </h2>
                           <span className="text-xs font-mono text-slate-500">{editingMember.id}</span>
                        </div>
                        <button onClick={() => setEditingMember(null)}><X size={20}/></button>
                    </div>
                    {!isEditingProfile && (
                        <div className="flex gap-6 border-b border-slate-200 text-sm font-medium">
                            <button onClick={() => setDetailTab('overview')} className={`pb-2 ${detailTab==='overview' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'}`}>Overview</button>
                            <button onClick={() => setDetailTab('financial')} className={`pb-2 ${detailTab==='financial' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'}`}>Financial</button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isEditingProfile ? (
                        <form onSubmit={(e) => { handleAdminUpdateMember(e); setIsEditingProfile(false); }} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Name</label>
                                <input name="name" defaultValue={editingMember.name} className="w-full p-2 border rounded" placeholder="Name"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Email</label>
                                <input name="email" type="email" defaultValue={editingMember.email} className="w-full p-2 border rounded" placeholder="Email"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Phone</label>
                                <input name="phone" type="tel" defaultValue={editingMember.phone} className="w-full p-2 border rounded" placeholder="Phone"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Beneficiary</label>
                                <input name="beneficiary" defaultValue={editingMember.beneficiary} className="w-full p-2 border rounded" placeholder="Beneficiary"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Status</label>
                                <select name="accountStatus" defaultValue={editingMember.accountStatus} className="w-full p-2 border rounded">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded font-bold">Save Changes</button>
                        </form>
                    ) : detailTab === 'overview' ? (
                       <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs uppercase font-bold text-slate-500">Contributions</p>
                                <p className="text-xl font-bold text-emerald-600">{formatCurrency(editingMember.totalContribution)}</p>
                             </div>
                             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs uppercase font-bold text-slate-500">Join Date</p>
                                <p className="text-xl font-bold text-slate-700">{formatDate(editingMember.joinDate)}</p>
                             </div>
                          </div>
                          
                          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-indigo-900 flex items-center gap-2"><Sparkles size={16}/> AI Insight</h3>
                                <button onClick={handleAnalyzeMember} disabled={isAnalyzing} className="text-xs bg-white border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-100">{isAnalyzing ? 'Thinking...' : 'Analyze'}</button>
                             </div>
                             {aiAnalysis && <p className="text-sm text-indigo-800 leading-relaxed">{aiAnalysis}</p>}
                          </div>

                          <div className="space-y-2">
                             <h4 className="text-sm font-bold text-slate-700">Recent Transactions</h4>
                             {transactions.filter(t => t.memberId === editingMember.id).slice(0,3).map(t => (
                               <div key={t.id} className="flex justify-between p-3 border-b border-slate-100 text-sm">
                                   <span>{t.type} <span className="text-slate-400 text-xs">({formatDate(t.date)})</span></span>
                                   <span className={t.type==='CONTRIBUTION' ? 'text-emerald-600 font-bold' : 'text-slate-600'}>${t.amount}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    ) : (
                       <div className="space-y-6 animate-in fade-in">
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                               <p className="text-sm font-bold text-slate-600 mb-2">Total Accumulated</p>
                               <p className="text-3xl font-bold text-emerald-600">{formatCurrency(editingMember.totalContribution)}</p>
                           </div>

                           <div>
                               <div className="flex justify-between items-center mb-4">
                                   <h3 className="font-bold text-slate-800">Yearly Breakdown</h3>
                                   {!isEditingFinancials ? (
                                       <button onClick={handleStartEditFinancials} className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                           <Edit2 size={14} /> Edit History
                                       </button>
                                   ) : (
                                       <div className="flex gap-2">
                                           <button onClick={handleCancelEditFinancials} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                                           <button onClick={handleSaveFinancials} className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                                               <Save size={14} /> Save Changes
                                           </button>
                                       </div>
                                   )}
                               </div>

                               {isEditingFinancials && (
                                   <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                                       <div className="flex gap-2 items-end">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Year</label>
                                                <input 
                                                    type="number" 
                                                    className="w-20 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                                    placeholder="2025" 
                                                    value={newYearInput} 
                                                    onChange={e => setNewYearInput(e.target.value)} 
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Amount ($)</label>
                                                <div className="flex gap-1">
                                                    <input 
                                                        type="number" 
                                                        className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                                        placeholder="0.00" 
                                                        value={newAmountInput} 
                                                        onChange={e => setNewAmountInput(e.target.value)} 
                                                    />
                                                    <button onClick={() => openMonthlyEditor('new', 0)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300" title="Calculate Months"><Calculator size={16}/></button>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleAddYear} 
                                                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 mb-[1px] shadow-sm"
                                                title="Add Year"
                                            >
                                                <Plus size={18}/>
                                            </button>
                                       </div>
                                       {monthlyEditorTarget === -1 && <MonthlyEditor />}
                                   </div>
                               )}

                               <div className="border border-slate-200 rounded-xl overflow-hidden">
                                   <table className="w-full text-sm text-left">
                                       <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                                           <tr>
                                               <th className="px-4 py-3">Year</th>
                                               <th className="px-4 py-3 text-right">Total</th>
                                               <th className="px-4 py-3 text-right text-slate-400">Monthly Avg</th>
                                               {isEditingFinancials && <th className="px-4 py-3 text-right w-10">Action</th>}
                                           </tr>
                                       </thead>
                                       <tbody className="divide-y divide-slate-100">
                                           {(isEditingFinancials ? Object.keys(tempHistory) : Object.keys(displayHistory))
                                               .map(Number)
                                               .sort((a,b) => b-a)
                                               .map(year => {
                                                   const amount = isEditingFinancials ? tempHistory[year] : displayHistory[year];
                                                   return (
                                                       <React.Fragment key={year}>
                                                           <tr className="hover:bg-slate-50">
                                                               <td className="px-4 py-3 font-medium text-slate-700">{year}</td>
                                                               <td className="px-4 py-3 text-right font-bold text-slate-800">
                                                                   {isEditingFinancials ? (
                                                                       <div className="flex justify-end gap-2 items-center">
                                                                           <input 
                                                                               type="number" 
                                                                               className="w-24 p-1 text-right border border-slate-300 rounded focus:outline-emerald-500 text-sm"
                                                                               value={tempHistory[year]}
                                                                               onChange={(e) => setTempHistory({...tempHistory, [year]: parseFloat(e.target.value) || 0})}
                                                                           />
                                                                           <button onClick={() => openMonthlyEditor(year, tempHistory[year])} className="p-1 bg-slate-100 rounded hover:bg-slate-200 text-slate-500"><Calculator size={14}/></button>
                                                                       </div>
                                                                   ) : (
                                                                       formatCurrency(amount)
                                                                   )}
                                                               </td>
                                                               <td className="px-4 py-3 text-right text-slate-400">{formatCurrency(amount/12)}</td>
                                                               {isEditingFinancials && (
                                                                   <td className="px-4 py-3 text-right">
                                                                       <button 
                                                                           onClick={() => handleDeleteYear(year)} 
                                                                           className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                                                           title="Delete Year"
                                                                       >
                                                                           <Trash2 size={16} />
                                                                       </button>
                                                                   </td>
                                                               )}
                                                           </tr>
                                                           {monthlyEditorTarget === year && (
                                                               <tr>
                                                                   <td colSpan={4} className="bg-slate-50 p-0">
                                                                       <div className="px-4"><MonthlyEditor /></div>
                                                                   </td>
                                                               </tr>
                                                           )}
                                                       </React.Fragment>
                                                   );
                                               })}
                                           {(isEditingFinancials ? Object.keys(tempHistory) : Object.keys(displayHistory)).length === 0 && (
                                               <tr><td colSpan={isEditingFinancials ? 4 : 3} className="p-4 text-center text-slate-400 italic">No historical data available.</td></tr>
                                           )}
                                       </tbody>
                                   </table>
                               </div>
                           </div>
                       </div>
                    )}
                </div>
            </div>
        </div>
      );
  };

  // ==========================================================================
  // REPORTS AND SYSTEM VIEWS
  // These components provide financial reporting and system management features
  // ==========================================================================

  /**
   * ReportsComponent: Financial analytics and visualization placeholder
   * 
   * PURPOSE:
   * Provides data visualization for fund performance metrics:
   * - Loan vs Contribution ratios (fund utilization)
   * - Member growth trends over time
   * - Payment delinquency tracking
   * 
   * FUTURE ENHANCEMENTS:
   * - Integrate with Recharts for interactive charts
   * - Add date range selectors for custom reporting periods
   * - Export capability for board reports
   */
  const ReportsComponent = () => (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4">Loan vs Contribution Ratio</h3>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400">
              Chart visualization (Recharts) would go here based on aggregated data.
          </div>
      </div>
  );

  /**
   * SystemView: Automation controls and system health monitoring
   * 
   * AUTOMATION FEATURES:
   * - Nightly Renewal Check: Sends 30-day reminders to members up for renewal
   * - Future: Payment reminder automation for loan due dates
   * - Future: Delinquency escalation workflows
   * 
   * SYSTEM HEALTH:
   * Displays operational status of integrated services:
   * - Database connectivity (localStorage in this version)
   * - AI service (Gemini API) availability
   * - Email service (SendGrid) status
   */
  const SystemView = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Clock size={20} className="text-purple-500"/> Task Automation</h3>
                <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div><div className="font-bold text-slate-700 text-sm">Nightly Renewal Check</div></div>
                        <button onClick={handleRunAutomation} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700">Run Now</button>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Activity size={20} className="text-emerald-500"/> System Health</h3>
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium mt-4">
                    <CheckCircle size={16}/> All systems operational.
                </div>
            </div>
        </div>
    </div>
  );

  // ==========================================================================
  // MODAL COMPONENTS
  // Overlay dialogs for specific workflows (batch upload, loan calculator)
  // ==========================================================================

  /**
   * BatchUploadModal: CSV import interface for bulk member enrollment
   * 
   * USE CASE:
   * When migrating from paper records or spreadsheets, admins can paste
   * CSV data directly to import multiple members at once.
   * 
   * CSV FORMAT:
   * Name,MemberID,Email,JoinDate
   * Each line creates a new member with default initial values
   */
  const BatchUploadModal = () => {
    const [csvText, setCsvText] = useState('');
    if (!showBatchUpload) return null;
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Batch Upload Members</h3>
                <textarea className="w-full h-48 p-3 border rounded text-xs font-mono" placeholder="Name,ID,Email,JoinDate" value={csvText} onChange={e => setCsvText(e.target.value)}/>
                <div className="flex gap-2 mt-4">
                    <button onClick={() => setShowBatchUpload(false)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                    <button onClick={() => handleBatchUpload(csvText)} className="flex-1 py-2 bg-emerald-600 text-white rounded">Upload</button>
                </div>
            </div>
        </div>
    );
  };

  /**
   * LoanCalculatorModal: Interactive loan estimation tool
   * 
   * PURPOSE:
   * Allows members/admins to calculate loan terms before applying:
   * - Monthly payment amounts based on loan principal and term
   * - Application fee based on 2024 fee structure
   * - Late fee policy information
   * 
   * FEE STRUCTURE (2024 Policy):
   * - Loans under $2,500: $30 flat application fee
   * - Loans $2,500-$5,000 with 12-month term: $50 fee
   * - Loans $2,500-$5,000 with 24-month term: $70 fee
   * 
   * WHY TIERED FEES:
   * - Larger loans require more administrative oversight
   * - Longer terms increase risk exposure, justifying higher fees
   * - Fee structure encourages shorter loan terms
   */
  const LoanCalculatorModal = () => {
    if (!showCalculator) return null;
    const [amount, setAmount] = useState(1000);
    const [term, setTerm] = useState(12);
    
    // Fee calculation based on 2024 policy tiers
    let fees = 0;
    if (amount <= 2500) {
        fees = 30; // Flat fee for smaller loans
    } else {
        fees = term <= 12 ? 50 : 70; // Higher fee for larger/longer loans
    }
    
    // Simple interest-free calculation (principal only, divided over term)
    const monthly = amount / term;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Calculator size={20} className="text-blue-500"/> Loan Calculator</h3>
                    <button onClick={() => setShowCalculator(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Amount ($)</label>
                        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg mt-1" max="5000"/>
                        <p className="text-[10px] text-slate-400 mt-1">Max: $5,000.00</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Term</label>
                        <select value={term} onChange={e => setTerm(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-1">
                            <option value={12}>12 Months</option>
                            <option value={24}>24 Months</option>
                        </select>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl space-y-3 mt-2 border border-slate-100">
                        <div className="flex justify-between text-sm text-slate-600"><span>Application Fee</span> <span className="font-bold text-slate-800">${fees}</span></div>
                        <div className="flex justify-between text-sm text-slate-600"><span>Late Fee Policy</span> <span className="font-medium">$5.00</span></div>
                        <div className="flex justify-between border-t border-slate-200 pt-3 font-bold text-lg text-emerald-600"><span>Monthly Payment</span> <span>${monthly.toFixed(2)}</span></div>
                    </div>
                    
                    <div className="text-[10px] text-slate-400 text-center px-4">
                        Payments are due on the 10th of each month. <br/>Borrowers must provide a signed personal check.
                    </div>

                    <button onClick={() => setShowCalculator(false)} className="w-full py-2.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
  };

  // ==========================================================================
  // RENDER LOGIC - View-based routing for the application
  // The render logic determines which view to display based on viewMode state
  // Each conditional block handles a different application state/page
  // ==========================================================================

  // Landing page - initial entry point for role selection
  if (viewMode === 'landing') {
      return <LandingPage setViewMode={setViewMode} />;
  }

  // Admin login - authentication form for fund managers
  if (viewMode === 'admin_login') {
      return <AdminLoginPage onLogin={handleAdminLogin} setViewMode={setViewMode} />;
  }

  // Member login - ID-based authentication for member self-service
  if (viewMode === 'member_login') {
      return <MemberLoginScreen onLogin={handleMemberLogin} loginError={loginError} setViewMode={setViewMode} />;
  }

  /**
   * Member Portal View - Read-only self-service dashboard
   * 
   * DISPLAYED DATA:
   * - Current contribution total (lifetime savings)
   * - Active loan details (if any) with next due date
   * - Account status and membership tenure
   * - Yearly contribution history breakdown
   * - Recent transaction activity
   * 
   * ACCESS CONTROL:
   * - All data is read-only; members cannot modify records
   * - Only shows data for the authenticated member (currentMemberUser)
   * - Sign out returns to landing page and clears session
   */
  if (viewMode === 'member_portal' && currentMemberUser) {
      // Retrieve the member's active loan (if any) by matching loan ID
      const activeLoan = loans.find(l => l.id === currentMemberUser.activeLoanId);
      
      // Get contribution history from state or fall back to seed data
      const history = contributionHistory[currentMemberUser.id] || CONTRIBUTION_HISTORY_DB[currentMemberUser.id] || {};
      const sortedYears = Object.keys(history).map(Number).sort((a,b) => b-a);
      
      // Filter transactions to show only this member's activity
      const memberTransactions = transactions.filter(t => t.memberId === currentMemberUser.id);

      return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
             <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
                 <div className="flex items-center gap-2 font-bold text-slate-800">
                    <div className="p-1.5 bg-emerald-500 rounded-lg text-white"><Users size={16} /></div>
                    Millionaires Club Portal
                 </div>
                 <div className="flex items-center gap-4">
                     <div className="text-right hidden sm:block">
                         <p className="text-sm font-bold text-slate-800">{currentMemberUser.name}</p>
                         <p className="text-xs text-slate-500">{currentMemberUser.id}</p>
                     </div>
                     <button onClick={() => { setViewMode('landing'); setCurrentMemberUser(null); }} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-600 flex items-center gap-2">
                         <LogOut size={18}/> <span className="text-xs font-bold hidden sm:inline">Sign Out</span>
                     </button>
                 </div>
             </div>

             <div className="max-w-5xl mx-auto p-6 space-y-6">
                 {/* Dashboard Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <h3 className="font-bold text-slate-500 text-sm mb-1 uppercase">My Contribution</h3>
                         <p className="text-3xl font-bold text-emerald-600">{formatCurrency(currentMemberUser.totalContribution)}</p>
                         <p className="text-xs text-slate-400 mt-2">Lifetime total accumulated</p>
                     </div>

                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <h3 className="font-bold text-slate-500 text-sm mb-1 uppercase">Active Loan</h3>
                         {activeLoan ? (
                             <div>
                                 <p className="text-3xl font-bold text-blue-600">{formatCurrency(activeLoan.remainingBalance)}</p>
                                 <p className="text-xs text-slate-500 mt-2">Next Due: <span className="font-bold text-slate-700">{formatDate(activeLoan.nextPaymentDue)}</span></p>
                             </div>
                         ) : (
                             <div>
                                 <p className="text-3xl font-bold text-slate-300">$0.00</p>
                                 <p className="text-xs text-slate-400 mt-2">No active loans</p>
                             </div>
                         )}
                     </div>

                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <h3 className="font-bold text-slate-500 text-sm mb-1 uppercase">Status</h3>
                         <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                             <CheckCircle size={14}/> {currentMemberUser.accountStatus}
                         </div>
                         <p className="text-xs text-slate-400 mt-3">Member since {new Date(currentMemberUser.joinDate).getFullYear()}</p>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Financial History Table */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                             <Wallet size={20} className="text-emerald-500"/> Contribution History
                         </h3>
                         <div className="overflow-hidden border border-slate-100 rounded-xl">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3">Year</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="px-4 py-3 text-right text-slate-400">Monthly Avg</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {sortedYears.map(year => (
                                        <tr key={year} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-700">{year}</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(history[year])}</td>
                                            <td className="px-4 py-3 text-right text-slate-400">{formatCurrency(history[year]/12)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                     </div>

                     {/* Recent Transactions */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                             <Activity size={20} className="text-blue-500"/> Recent Activity
                         </h3>
                         <div className="space-y-3">
                             {memberTransactions.length > 0 ? memberTransactions.slice(0, 5).map(t => (
                                 <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                     <div>
                                         <p className="font-bold text-sm text-slate-700">{t.type.replace('_', ' ')}</p>
                                         <p className="text-xs text-slate-400">{formatDate(t.date)}</p>
                                     </div>
                                     <span className={`font-bold text-sm ${t.type === 'CONTRIBUTION' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                         {t.type === 'CONTRIBUTION' ? '+' : ''}${t.amount}
                                     </span>
                                 </div>
                             )) : (
                                 <p className="text-slate-400 italic text-center py-6">No recent transactions found.</p>
                             )}
                         </div>
                     </div>
                 </div>
             </div>
        </div>
      );
  }

  // ==========================================================================
  // ADMIN DASHBOARD LAYOUT
  // Full-featured workspace for fund administrators with:
  // - Sidebar navigation for all management sections
  // - Tab-based content switching for modular views
  // - Modal overlays for detail views and utilities
  // - Toast notifications for user feedback
  // ==========================================================================
  
  /**
   * Admin Dashboard Structure:
   * 
   * NAVIGATION TABS:
   * - Dashboard: Overview with key metrics and action items
   * - Members: Full member list with search, add, and edit capabilities
   * - Contributions: Record new contributions and view history
   * - Loans: Issue new loans, track active loans, record repayments
   * - Transactions: Complete audit trail of all financial activity
   * - Reports: Analytics and visualizations (placeholder)
   * - System & Auto: Automation controls and system health
   * 
   * OVERLAY COMPONENTS:
   * - MemberDetailPane: Slide-out panel for member details (AI-powered)
   * - BatchUploadModal: CSV import interface for bulk enrollment
   * - LoanCalculatorModal: Interactive loan term calculator
   * - Toast notifications: Temporary feedback messages
   */
  return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* Overlay components rendered outside main layout flow */}
      <MemberDetailPane />
      <BatchUploadModal />
      <LoanCalculatorModal />
      
      {/* Toast Notification Container - positioned top-right, stacks vertically */}
      <div className="fixed top-6 right-6 z-[90] flex flex-col gap-3 pointer-events-none">
          {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white text-sm font-medium ${n.type === 'error' ? 'bg-red-500' : 'bg-slate-800'}`}>
              {n.message}
          </div>
          ))}
      </div>

      {/* 
        Sidebar Navigation
        - Fixed position on mobile (slide-out drawer)
        - Static position on desktop (always visible)
        - Contains all navigation items and quick actions
      */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-400 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 flex justify-between items-center">
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500 rounded-lg text-white"><Users size={20} /></div>
              Millionaires Club
              </h1>
              <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button>
          </div>
          {/* 
            Primary Navigation Items
            Each tab loads a different sub-component in the main content area
            State flows from parent (App) to child components via props
          */}
          <nav className="p-4 space-y-1.5 flex-1">
              <NavItem id="dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" activeTab={activeTab} setActiveTab={(t: string) => {setActiveTab(t); setIsMobileMenuOpen(false);}} />
              <NavItem id="members" icon={<Users size={18} />} label="Members" activeTab={activeTab} setActiveTab={(t: string) => {setActiveTab(t); setIsMobileMenuOpen(false);}} />
              <NavItem id="contributions" icon={<Wallet size={18} />} label="Contributions" activeTab={activeTab} setActiveTab={(t: string) => {setActiveTab(t); setIsMobileMenuOpen(false);}} />
              <NavItem id="loans" icon={<ArrowRightLeft size={18} />} label="Loans" activeTab={activeTab} setActiveTab={(t: string) => {setActiveTab(t); setIsMobileMenuOpen(false);}} />
              <NavItem id="transactions" icon={<FileText size={18} />} label="Transactions" activeTab={activeTab} setActiveTab={(t: string) => {setActiveTab(t); setIsMobileMenuOpen(false);}} />
              <NavItem id="reports" icon={<BarChart3 size={18} />} label="Reports" activeTab={activeTab} setActiveTab={(t: string) => {setActiveTab(t); setIsMobileMenuOpen(false);}} />
              <div className="my-4 border-t border-slate-800"></div>
              <NavItem id="system" icon={<Settings size={18} />} label="System & Auto" activeTab={activeTab} setActiveTab={(t: string) => {setActiveTab(t); setIsMobileMenuOpen(false);}} />
          </nav>
          {/* Sidebar Footer: Quick actions and user info */}
          <div className="p-6 border-t border-slate-800 space-y-4">
              <button onClick={() => setShowCalculator(true)} className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-bold transition-colors">
                  <Calculator size={14}/> Loan Calculator
              </button>
              <button 
                  onClick={() => setViewMode('landing')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg text-xs font-bold transition-colors"
              >
                  <LogOut size={14}/> Log Out
              </button>
              <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold">A</div>
                  <div><p className="text-white font-medium">Admin User</p></div>
              </div>
          </div>
      </aside>

      {/* 
        Main Content Area
        - Flexible layout that fills remaining space
        - Mobile header with hamburger menu
        - Content switches based on activeTab state
      */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Mobile Header - only visible on small screens */}
          <header className="bg-white border-b border-slate-200 p-4 md:hidden flex justify-between items-center">
              <h1 className="font-bold text-slate-800">Millionaires Club</h1>
              <button onClick={() => setIsMobileMenuOpen(true)}><Menu size={24}/></button>
          </header>

          {/* Scrollable Content Container */}
          <div className="flex-1 p-4 md:p-10 overflow-y-auto">
              {/* Page Header - desktop only */}
              <header className="mb-6 hidden md:block">
              <h2 className="text-3xl font-bold text-slate-800 capitalize tracking-tight">{activeTab}</h2>
              <p className="text-slate-500 mt-1">Manage your community portfolio efficiently.</p>
              </header>
              
              {/* 
                Tab Content Rendering
                Each component receives only the props it needs
                State update functions are passed to enable child components
                to modify parent state (controlled components pattern)
              */}
              {activeTab === 'dashboard' && <DashboardComponent members={members} loans={loans} transactions={transactions} setActiveTab={setActiveTab} />}
              {activeTab === 'members' && <MembersListComponent members={members} setEditingMember={setEditingMember} handleAddMember={handleAddMember} setShowBatchUpload={setShowBatchUpload} />}
              {activeTab === 'contributions' && <ContributionsComponent members={members} setMembers={setMembers} transactions={transactions} setTransactions={setTransactions} notify={notify} />}
              {activeTab === 'loans' && <LoansComponent members={members} setMembers={setMembers} loans={loans} setLoans={setLoans} transactions={transactions} setTransactions={setTransactions} notify={notify} checkEligibility={checkEligibility} />}
              {activeTab === 'transactions' && <TransactionHistoryComponent members={members} transactions={transactions} />}
              {activeTab === 'reports' && <ReportsComponent />}
              {activeTab === 'system' && <SystemView />}
          </div>
      </main>
      </div>
  );
}