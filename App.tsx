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
import { StorageService, STORAGE_KEYS } from './services/storageService';

// Sub-components
import DashboardComponent from './components/DashboardComponent';
import MembersListComponent from './components/MembersListComponent';
import ContributionsComponent from './components/ContributionsComponent';
import LoansComponent from './components/LoansComponent';
import TransactionHistoryComponent from './components/TransactionHistoryComponent';
import ReportsComponent from './components/ReportsComponent';

const generateId = () => Math.random().toString(36).substr(2, 9);
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const getMonthDiff = (d1: string, d2: Date) => {
  const date1 = new Date(d1);
  return (d2.getFullYear() - date1.getFullYear()) * 12 + (d2.getMonth() - date1.getMonth());
};

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

// --- Extracted Components ---

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

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'admin_login' | 'admin_dashboard' | 'member_login' | 'member_portal'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<{id: number, message: string, type: 'success' | 'error' | 'info'}[]>([]);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [currentMemberUser, setCurrentMemberUser] = useState<Member | null>(null);
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // -- State --
  const [members, setMembers] = useState<Member[]>(() => {
    return StorageService.load(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    return StorageService.load(STORAGE_KEYS.LOANS, []);
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return StorageService.load(STORAGE_KEYS.TRANSACTIONS, []);
  });

  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(() => {
      return StorageService.load(STORAGE_KEYS.COMMUNICATION_LOGS, [
          { id: 'c1', memberId: 'MC-000001', type: 'System', content: 'Renewal Reminder Sent (30 Days)', date: '2025-11-25T10:00:00', direction: 'Outbound' }
      ]);
  });

  const [contributionHistory, setContributionHistory] = useState<Record<string, YearlyContribution>>(() => {
      return StorageService.load('contribution_history', CONTRIBUTION_HISTORY_DB);
  });

  // -- Persistence --
  useEffect(() => { StorageService.save(STORAGE_KEYS.MEMBERS, members); }, [members]);
  useEffect(() => { StorageService.save(STORAGE_KEYS.LOANS, loans); }, [loans]);
  useEffect(() => { StorageService.save(STORAGE_KEYS.TRANSACTIONS, transactions); }, [transactions]);
  useEffect(() => { StorageService.save(STORAGE_KEYS.COMMUNICATION_LOGS, communicationLogs); }, [communicationLogs]);
  useEffect(() => { StorageService.save('contribution_history', contributionHistory); }, [contributionHistory]);

  // -- Notification Helper --
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const calculateLoanLimit = (member: Member) => {
    const fourTimeContribution = member.totalContribution * 4;
    return Math.min(fourTimeContribution, 5000);
  };

  const checkEligibility = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return { eligible: false, reason: 'Member not found' };
    
    if (member.accountStatus === 'Inactive') return { eligible: false, reason: 'Inactive account' };
    if (member.activeLoanId) return { eligible: false, reason: 'Active loan exists' };
    if (member.totalContribution <= 0) return { eligible: false, reason: 'No contributions' };

    // Check if member is a cosigner on an existing ACTIVE loan
    const isActiveCosigner = loans.some(l => l.cosignerId === memberId && l.status === 'ACTIVE');
    if (isActiveCosigner) {
      return { eligible: false, reason: 'Active cosigner on another loan' };
    }

    if (member.lastLoanPaidDate) {
      const monthsSincePaid = getMonthDiff(member.lastLoanPaidDate, new Date());
      // 3 Month cool-off period
      if (monthsSincePaid < 3) {
        return { eligible: false, reason: `Cool-off (${3 - monthsSincePaid} mo. left)` };
      }
    }
    return { eligible: true, limit: calculateLoanLimit(member) };
  };

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
    
    if (members.some(m => m.id === newMember.id)) {
        notify('Member ID already exists!', 'error');
        return;
    }

    setMembers([...members, newMember]);
    notify(`Member ${newMember.name} added successfully!`);
    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteMember = (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member) return;

    // Check for active loan or being a cosigner
    if (member.activeLoanId) {
        notify("Cannot delete member with an active loan.", "error");
        return;
    }
    const isCosigner = loans.some(l => l.cosignerId === id && l.status === 'ACTIVE');
    if (isCosigner) {
        notify("Cannot delete member who is a cosigner on an active loan.", "error");
        return;
    }

    if (window.confirm(`Are you sure you want to delete ${member.name} (${member.id})? This action cannot be undone.`)) {
        setMembers(prev => prev.filter(m => m.id !== id));
        // Optionally remove history and transactions if needed, but keeping them for ledger might be better.
        notify("Member deleted successfully.", "info");
        if (editingMember?.id === id) setEditingMember(null);
    }
  };

  const handleBatchUpload = (csvText: string) => {
      const lines = csvText.trim().split('\n');
      let addedCount = 0;
      const newMembers: Member[] = [];

      lines.forEach(line => {
          const [name, id, email, joinDate] = line.split(',').map(s => s.trim());
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

  const handleRunAutomation = () => {
      notify('Starting Daily Automation Jobs...', 'info');
      setTimeout(() => {
        let updates = 0;
        const newLogs: CommunicationLog[] = [];
        members.forEach(m => {
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
      }, 1500);
  };

  const handleAddNote = (memberId: string, content: string) => {
      const newLog: CommunicationLog = {
          id: generateId(), memberId, type: 'Note', direction: 'Inbound',
          content, date: new Date().toISOString(), adminId: 'Admin'
      };
      setCommunicationLogs([newLog, ...communicationLogs]);
  };

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

  // --- Member Auth Logic ---
  const [loginError, setLoginError] = useState('');
  
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

  // --- Admin Auth Logic ---
  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // For demo purposes, we accept any input. In prod, check credentials.
      notify('Access Granted. Welcome to Workspace.');
      setViewMode('admin_dashboard');
  };

  // --- Member Detail Modal (with AI) ---
  const MemberDetailPane = () => {
      if (!editingMember) return null;
      const [detailTab, setDetailTab] = useState<'overview' | 'financial' | 'timeline'>('overview');
      const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [isEditingProfile, setIsEditingProfile] = useState(false);
      
      // Financial CRUD State
      const [isEditingFinancials, setIsEditingFinancials] = useState(false);
      const [tempHistory, setTempHistory] = useState<YearlyContribution>({});
      const [newYearInput, setNewYearInput] = useState('');
      const [newAmountInput, setNewAmountInput] = useState('');

      // Monthly Editing State
      const [monthlyEditorTarget, setMonthlyEditorTarget] = useState<number | null>(null);
      const [monthlyValues, setMonthlyValues] = useState<number[]>(Array(12).fill(0));

      // Get historical data (Source of truth is State, fallback to empty)
      const displayHistory = contributionHistory[editingMember.id] || {};
      const sortedYears = Object.keys(displayHistory).map(Number).sort((a,b) => b-a);

      const handleAnalyzeMember = async () => {
          setIsAnalyzing(true);
          const prompt = `Analyze this member: ${editingMember.name}, Join Date: ${editingMember.joinDate}, Contribution: $${editingMember.totalContribution}. Status: ${editingMember.accountStatus}. Provide a brief risk assessment for a loan eligibility check (Max loan is 4x contribution).`;
          const result = await callGemini(prompt);
          setAiAnalysis(result);
          setIsAnalyzing(false);
      };

      // Financial CRUD Handlers
      const handleStartEditFinancials = () => {
          setTempHistory({ ...displayHistory });
          setIsEditingFinancials(true);
      };

      const handleCancelEditFinancials = () => {
          setIsEditingFinancials(false);
          setTempHistory({});
          setNewYearInput('');
          setNewAmountInput('');
          setMonthlyEditorTarget(null);
      };

      const handleSaveFinancials = () => {
          // Calculate new total
          const newTotal = Object.values(tempHistory).reduce((sum: number, val: number) => sum + val, 0);
          
          // Update History State
          setContributionHistory(prev => ({
              ...prev,
              [editingMember.id]: tempHistory
          }));

          // Update Member Total Contribution Sync
          const updatedMember = { ...editingMember, totalContribution: newTotal };
          setMembers(prev => prev.map(m => m.id === editingMember.id ? updatedMember : m));
          setEditingMember(updatedMember); // Update local view
          
          setIsEditingFinancials(false);
          notify('Financial history updated and member total recalculated.');
      };

      const handleDeleteYear = (year: number) => {
          const next = { ...tempHistory };
          delete next[year];
          setTempHistory(next);
      };

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

      // Monthly Editor Logic
      const openMonthlyEditor = (year: number | 'new', currentTotal: number) => {
          // If editing an existing year, we roughly distribute the total or start fresh
          // Since we don't store months yet, we'll just start with [total/12, total/12...] approximation or zeros?
          // Let's assume start with 0s for easier "add up" or average.
          // Better: If it's a new year, 0s. If existing, allow user to input.
          setMonthlyValues(Array(12).fill(0)); 
          setMonthlyEditorTarget(year === 'new' ? -1 : year);
      };

      const handleMonthlyChange = (index: number, val: string) => {
          const newVals = [...monthlyValues];
          newVals[index] = parseFloat(val) || 0;
          setMonthlyValues(newVals);
      };

      const saveMonthlyEditor = () => {
          const sum = monthlyValues.reduce((a, b) => a + b, 0);
          if (monthlyEditorTarget === -1) {
              setNewAmountInput(sum.toFixed(2));
          } else if (monthlyEditorTarget !== null) {
              setTempHistory({ ...tempHistory, [monthlyEditorTarget]: sum });
          }
          setMonthlyEditorTarget(null);
      };

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

  const handleExportData = () => {
    const allData = {
      members,
      loans,
      transactions,
      communicationLogs,
      contributionHistory,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `millionaires-club-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify('Data exported successfully!', 'success');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.members) setMembers(importedData.members);
        if (importedData.loans) setLoans(importedData.loans);
        if (importedData.transactions) setTransactions(importedData.transactions);
        if (importedData.communicationLogs) setCommunicationLogs(importedData.communicationLogs);
        if (importedData.contributionHistory) setContributionHistory(importedData.contributionHistory);
        
        notify('Data imported successfully!', 'success');
      } catch (error) {
        notify('Error importing data. Please check the file format.', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleClearAllData = () => {
    if (window.confirm('⚠️ WARNING: This will delete ALL data permanently. Are you sure?')) {
      if (window.confirm('This action cannot be undone. Export a backup first! Continue?')) {
        StorageService.clearAll();
        setMembers(INITIAL_MEMBERS);
        setLoans([]);
        setTransactions([]);
        setCommunicationLogs([]);
        setContributionHistory(CONTRIBUTION_HISTORY_DB);
        notify('All data cleared', 'info');
      }
    }
  };

  const SystemView = () => {
    const dataSize = new Blob([JSON.stringify({ members, loans, transactions })]).size;
    const dataSizeKB = (dataSize / 1024).toFixed(2);
    const lastSync = StorageService.load(STORAGE_KEYS.LAST_SYNC, null);

    return (
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
                  <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                          <CheckCircle size={16}/> All systems operational
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                          <div className="flex justify-between"><span>Data Size:</span><span className="font-mono font-bold">{dataSizeKB} KB</span></div>
                          <div className="flex justify-between"><span>Members:</span><span className="font-bold">{members.length}</span></div>
                          <div className="flex justify-between"><span>Active Loans:</span><span className="font-bold">{loans.filter(l => l.status === 'ACTIVE').length}</span></div>
                          <div className="flex justify-between"><span>Transactions:</span><span className="font-bold">{transactions.length}</span></div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Data Management */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Download size={20} className="text-blue-500"/> Data Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                      onClick={handleExportData}
                      className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all group"
                  >
                      <Download size={24} className="text-blue-600 group-hover:scale-110 transition-transform"/>
                      <div className="text-center">
                          <div className="font-bold text-blue-900 text-sm">Export Backup</div>
                          <div className="text-xs text-blue-600 mt-1">Download all data as JSON</div>
                      </div>
                  </button>

                  <label className="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-xl transition-all cursor-pointer group">
                      <Upload size={24} className="text-emerald-600 group-hover:scale-110 transition-transform"/>
                      <div className="text-center">
                          <div className="font-bold text-emerald-900 text-sm">Import Backup</div>
                          <div className="text-xs text-emerald-600 mt-1">Restore from JSON file</div>
                      </div>
                      <input 
                          type="file" 
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                      />
                  </label>

                  <button 
                      onClick={handleClearAllData}
                      className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-all group"
                  >
                      <Trash2 size={24} className="text-red-600 group-hover:scale-110 transition-transform"/>
                      <div className="text-center">
                          <div className="font-bold text-red-900 text-sm">Clear All Data</div>
                          <div className="text-xs text-red-600 mt-1">Reset to defaults</div>
                      </div>
                  </button>
              </div>
              
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0"/>
                      <div>
                          <strong>Data Storage:</strong> All data is stored locally in your browser's LocalStorage. 
                          Export regular backups to prevent data loss. Data persists across browser sessions.
                          {lastSync && <div className="mt-1 text-slate-500">Last saved: {formatDateTime(lastSync)}</div>}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
  };

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

  const LoanCalculatorModal = () => {
    if (!showCalculator) return null;
    const [amount, setAmount] = useState(1000);
    const [term, setTerm] = useState(12);
    
    // Updated Fee Logic
    let fees = 0;
    if (amount <= 2500) {
        fees = 30;
    } else {
        fees = term <= 12 ? 50 : 70;
    }
    
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

  // --- RENDER LOGIC ---

  if (viewMode === 'landing') {
      return <LandingPage setViewMode={setViewMode} />;
  }

  if (viewMode === 'admin_login') {
      return <AdminLoginPage onLogin={handleAdminLogin} setViewMode={setViewMode} />;
  }

  if (viewMode === 'member_login') {
      return <MemberLoginScreen onLogin={handleMemberLogin} loginError={loginError} setViewMode={setViewMode} />;
  }

  if (viewMode === 'member_portal' && currentMemberUser) {
      const [memberTab, setMemberTab] = useState<'dashboard' | 'profile' | 'payments' | 'documents'>('dashboard');
      const activeLoan = loans.find(l => l.id === currentMemberUser.activeLoanId);
      const history = contributionHistory[currentMemberUser.id] || CONTRIBUTION_HISTORY_DB[currentMemberUser.id] || {};
      const sortedYears = Object.keys(history).map(Number).sort((a,b) => b-a);
      const memberTransactions = transactions.filter(t => t.memberId === currentMemberUser.id);
      const [showPaymentModal, setShowPaymentModal] = useState(false);
      const [paymentMethod, setPaymentMethod] = useState<'zelle' | 'ach' | ''>('');
      
      // Profile editing states
      const [isEditingProfile, setIsEditingProfile] = useState(false);
      const [isEditingBeneficiary, setIsEditingBeneficiary] = useState(false);
      const [profileForm, setProfileForm] = useState({
          name: currentMemberUser.name,
          email: currentMemberUser.profile?.email || currentMemberUser.email || '',
          phone: currentMemberUser.profile?.phone || currentMemberUser.phone || '',
          address: currentMemberUser.profile?.address || currentMemberUser.address || '',
          city: currentMemberUser.profile?.city || '',
          state: currentMemberUser.profile?.state || '',
          zipCode: currentMemberUser.profile?.zipCode || '',
      });
      const [beneficiaryForm, setBeneficiaryForm] = useState({
          name: currentMemberUser.profile?.beneficiary?.name || currentMemberUser.beneficiary || '',
          relationship: currentMemberUser.profile?.beneficiary?.relationship || 'Spouse',
          phone: currentMemberUser.profile?.beneficiary?.phone || '',
          email: currentMemberUser.profile?.beneficiary?.email || '',
      });
      
      // Payment confirmation states
      const [pendingPayment, setPendingPayment] = useState<{amount: number, method: string, reference: string} | null>(null);
      const [paymentStep, setPaymentStep] = useState<'select' | 'instructions' | 'confirm'>('select');
      
      // Auto-pay toggle
      const [autoPayEnabled, setAutoPayEnabled] = useState(currentMemberUser.profile?.autoPayEnabled || false);
      
      // Save profile handler
      const handleSaveProfile = () => {
          const updatedMember = {
              ...currentMemberUser,
              name: profileForm.name,
              email: profileForm.email,
              phone: profileForm.phone,
              address: profileForm.address,
              profile: {
                  ...currentMemberUser.profile,
                  email: profileForm.email,
                  phone: profileForm.phone,
                  address: profileForm.address,
                  city: profileForm.city,
                  state: profileForm.state,
                  zipCode: profileForm.zipCode,
                  beneficiary: currentMemberUser.profile?.beneficiary || { name: '', relationship: '', phone: '', email: '' },
                  autoPayEnabled: autoPayEnabled,
                  preferredPaymentMethod: currentMemberUser.profile?.preferredPaymentMethod || 'none',
              }
          };
          setMembers(prev => prev.map(m => m.id === currentMemberUser.id ? updatedMember : m));
          setCurrentMemberUser(updatedMember);
          setIsEditingProfile(false);
          notify('Profile updated successfully!', 'success');
      };
      
      // Save beneficiary handler
      const handleSaveBeneficiary = () => {
          const updatedMember = {
              ...currentMemberUser,
              beneficiary: beneficiaryForm.name,
              profile: {
                  ...currentMemberUser.profile,
                  email: currentMemberUser.profile?.email || '',
                  phone: currentMemberUser.profile?.phone || '',
                  address: currentMemberUser.profile?.address || '',
                  city: currentMemberUser.profile?.city || '',
                  state: currentMemberUser.profile?.state || '',
                  zipCode: currentMemberUser.profile?.zipCode || '',
                  autoPayEnabled: autoPayEnabled,
                  preferredPaymentMethod: currentMemberUser.profile?.preferredPaymentMethod || 'none',
                  beneficiary: beneficiaryForm,
              }
          };
          setMembers(prev => prev.map(m => m.id === currentMemberUser.id ? updatedMember : m));
          setCurrentMemberUser(updatedMember);
          setIsEditingBeneficiary(false);
          notify('Beneficiary information updated!', 'success');
      };
      
      // Payment confirmation handler
      const handlePaymentConfirmation = (method: 'zelle' | 'ach') => {
          const reference = `PAY-${Date.now().toString(36).toUpperCase()}`;
          setPendingPayment({ amount: 20, method, reference });
          setPaymentStep('confirm');
      };
      
      // Record payment after confirmation
      const handleRecordPayment = () => {
          if (!pendingPayment) return;
          
          const newTransaction: Transaction = {
              id: generateId(),
              memberId: currentMemberUser.id,
              type: 'CONTRIBUTION',
              amount: pendingPayment.amount,
              date: new Date().toISOString().split('T')[0],
              description: `Monthly contribution via ${pendingPayment.method.toUpperCase()}`,
              paymentMethod: pendingPayment.method,
          };
          
          setTransactions(prev => [...prev, newTransaction]);
          
          // Update member contribution
          const updatedMember = {
              ...currentMemberUser,
              totalContribution: (currentMemberUser.totalContribution || 0) + pendingPayment.amount,
          };
          setMembers(prev => prev.map(m => m.id === currentMemberUser.id ? updatedMember : m));
          setCurrentMemberUser(updatedMember);
          
          setShowPaymentModal(false);
          setPendingPayment(null);
          setPaymentMethod('');
          setPaymentStep('select');
          notify(`Payment of $${pendingPayment.amount.toFixed(2)} recorded successfully!`, 'success');
      };

      return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
             {/* Header */}
             <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                 <div className="flex items-center gap-2 font-bold text-slate-800">
                    <div className="p-1.5 bg-emerald-500 rounded-lg text-white"><Users size={16} /></div>
                    Millionaires Club Portal
                 </div>
                 <div className="flex items-center gap-4">
                     <button onClick={() => setShowPaymentModal(true)} className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-bold">
                         <Wallet size={16}/> Make Payment
                     </button>
                     <div className="text-right hidden sm:block">
                         <p className="text-sm font-bold text-slate-800">{currentMemberUser.name}</p>
                         <p className="text-xs text-slate-500">{currentMemberUser.id}</p>
                     </div>
                     <button onClick={() => { setViewMode('landing'); setCurrentMemberUser(null); }} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-600 flex items-center gap-2">
                         <LogOut size={18}/> <span className="text-xs font-bold hidden sm:inline">Sign Out</span>
                     </button>
                 </div>
             </div>

             {/* Navigation Tabs */}
             <div className="bg-white border-b border-slate-200">
                 <div className="max-w-7xl mx-auto px-6">
                     <div className="flex gap-1 overflow-x-auto">
                         <button 
                             onClick={() => setMemberTab('dashboard')}
                             className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all ${
                                 memberTab === 'dashboard' 
                                 ? 'text-emerald-600 border-b-2 border-emerald-600' 
                                 : 'text-slate-500 hover:text-slate-700'
                             }`}
                         >
                             <div className="flex items-center gap-2">
                                 <LayoutDashboard size={16}/> Dashboard
                             </div>
                         </button>
                         <button 
                             onClick={() => setMemberTab('profile')}
                             className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all ${
                                 memberTab === 'profile' 
                                 ? 'text-emerald-600 border-b-2 border-emerald-600' 
                                 : 'text-slate-500 hover:text-slate-700'
                             }`}
                         >
                             <div className="flex items-center gap-2">
                                 <UserCheck size={16}/> Profile
                             </div>
                         </button>
                         <button 
                             onClick={() => setMemberTab('payments')}
                             className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all ${
                                 memberTab === 'payments' 
                                 ? 'text-emerald-600 border-b-2 border-emerald-600' 
                                 : 'text-slate-500 hover:text-slate-700'
                             }`}
                         >
                             <div className="flex items-center gap-2">
                                 <Wallet size={16}/> Payments
                             </div>
                         </button>
                         <button 
                             onClick={() => setMemberTab('documents')}
                             className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all ${
                                 memberTab === 'documents' 
                                 ? 'text-emerald-600 border-b-2 border-emerald-600' 
                                 : 'text-slate-500 hover:text-slate-700'
                             }`}
                         >
                             <div className="flex items-center gap-2">
                                 <FileText size={16}/> Documents
                             </div>
                         </button>
                     </div>
                 </div>
             </div>

             {/* Payment Modal */}
             {showPaymentModal && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                     <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="font-bold text-2xl text-slate-800 flex items-center gap-2">
                                 <Wallet size={24} className="text-emerald-500"/> Make a Payment
                             </h3>
                             <button onClick={() => { setShowPaymentModal(false); setPaymentMethod(''); }}>
                                 <X size={24} className="text-slate-400 hover:text-slate-600"/>
                             </button>
                         </div>

                         {!paymentMethod ? (
                             <div className="space-y-4">
                                 <p className="text-slate-600 mb-6">Choose your preferred payment method:</p>
                                 
                                 {/* Zelle Option */}
                                 <button 
                                     onClick={() => setPaymentMethod('zelle')}
                                     className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
                                 >
                                     <div className="flex items-center gap-4">
                                         <div className="p-3 bg-purple-100 group-hover:bg-purple-200 rounded-xl">
                                             <ArrowRightLeft size={24} className="text-purple-600"/>
                                         </div>
                                         <div className="flex-1">
                                             <h4 className="font-bold text-lg text-slate-800">Zelle</h4>
                                             <p className="text-sm text-slate-500">Instant transfer via Zelle</p>
                                         </div>
                                         <ChevronRight className="text-slate-400 group-hover:text-emerald-600"/>
                                     </div>
                                 </button>

                                 {/* QuickBooks ACH Option */}
                                 <button 
                                     onClick={() => setPaymentMethod('ach')}
                                     className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
                                 >
                                     <div className="flex items-center gap-4">
                                         <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl">
                                             <Calculator size={24} className="text-blue-600"/>
                                         </div>
                                         <div className="flex-1">
                                             <h4 className="font-bold text-lg text-slate-800">ACH Transfer</h4>
                                             <p className="text-sm text-slate-500">Direct bank transfer via QuickBooks</p>
                                         </div>
                                         <ChevronRight className="text-slate-400 group-hover:text-emerald-600"/>
                                     </div>
                                 </button>
                             </div>
                         ) : paymentMethod === 'zelle' ? (
                             <div className="space-y-6">
                                 <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                                     <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                                         <ArrowRightLeft size={18}/> Zelle Payment Instructions
                                     </h4>
                                     <div className="space-y-3 text-sm">
                                         <div>
                                             <p className="text-purple-600 font-medium">Send to:</p>
                                             <p className="font-mono text-lg font-bold text-purple-900">payments@millionairesclub.com</p>
                                         </div>
                                         <div>
                                             <p className="text-purple-600 font-medium">Amount:</p>
                                             <p className="text-2xl font-bold text-purple-900">$20.00</p>
                                             <p className="text-xs text-purple-600 mt-1">Monthly contribution</p>
                                         </div>
                                         <div>
                                             <p className="text-purple-600 font-medium">Reference:</p>
                                             <p className="font-mono font-bold text-purple-900">{currentMemberUser.id} - {currentMemberUser.name}</p>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="bg-slate-50 p-4 rounded-xl">
                                     <h5 className="font-bold text-slate-700 mb-2">How to pay:</h5>
                                     <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                                         <li>Open your banking app</li>
                                         <li>Find Zelle® in your app</li>
                                         <li>Add recipient: <span className="font-mono font-bold">payments@millionairesclub.com</span></li>
                                         <li>Enter amount: <span className="font-bold">$20.00</span></li>
                                         <li>Add note: <span className="font-mono">{currentMemberUser.id}</span></li>
                                         <li>Review and send</li>
                                     </ol>
                                 </div>

                                 <div className="flex gap-3">
                                     <button 
                                         onClick={() => setPaymentMethod('')}
                                         className="flex-1 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
                                     >
                                         Back
                                     </button>
                                     <button 
                                         onClick={() => { setShowPaymentModal(false); setPaymentMethod(''); notify('Payment instructions copied!', 'success'); }}
                                         className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                                     >
                                         Done
                                     </button>
                                 </div>
                             </div>
                         ) : (
                             <div className="space-y-6">
                                 <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                     <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                         <Calculator size={18}/> ACH Transfer via QuickBooks
                                     </h4>
                                     <div className="space-y-3 text-sm">
                                         <div>
                                             <p className="text-blue-600 font-medium">Account Name:</p>
                                             <p className="font-bold text-blue-900">Millionaires Club Fund</p>
                                         </div>
                                         <div>
                                             <p className="text-blue-600 font-medium">Account Number:</p>
                                             <p className="font-mono text-lg font-bold text-blue-900">****1234</p>
                                         </div>
                                         <div>
                                             <p className="text-blue-600 font-medium">Routing Number:</p>
                                             <p className="font-mono text-lg font-bold text-blue-900">021000021</p>
                                         </div>
                                         <div>
                                             <p className="text-blue-600 font-medium">Amount:</p>
                                             <p className="text-2xl font-bold text-blue-900">$20.00</p>
                                         </div>
                                         <div>
                                             <p className="text-blue-600 font-medium">Reference:</p>
                                             <p className="font-mono font-bold text-blue-900">{currentMemberUser.id}</p>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="bg-slate-50 p-4 rounded-xl">
                                     <h5 className="font-bold text-slate-700 mb-2">Processing Time:</h5>
                                     <p className="text-sm text-slate-600">ACH transfers typically take 1-3 business days to process. You'll receive a confirmation email once the payment is received.</p>
                                 </div>

                                 <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                                     <p className="text-xs text-amber-800 flex items-start gap-2">
                                         <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>
                                         <span>Please ensure you include your Member ID ({currentMemberUser.id}) in the transfer reference to ensure proper crediting.</span>
                                     </p>
                                 </div>

                                 <div className="flex gap-3">
                                     <button 
                                         onClick={() => setPaymentMethod('')}
                                         className="flex-1 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
                                     >
                                         Back
                                     </button>
                                     <button 
                                         onClick={() => { setShowPaymentModal(false); setPaymentMethod(''); notify('Bank details noted', 'info'); }}
                                         className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                                     >
                                         Done
                                     </button>
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
             )}

             <div className="max-w-7xl mx-auto p-4 sm:p-6">
                 {/* Dashboard Tab */}
                 {memberTab === 'dashboard' && (
                     <>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                             <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                                 <div className="flex items-center justify-between mb-2">
                                     <p className="text-slate-500 text-sm">My Contribution</p>
                                     <DollarSign size={20} className="text-emerald-500"/>
                                 </div>
                                 <p className="text-3xl font-bold text-slate-900">${currentMemberUser.contribution.toFixed(2)}</p>
                                 <p className="text-xs text-slate-500 mt-2">Total contributed to club</p>
                             </div>

                             <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                                 <div className="flex items-center justify-between mb-2">
                                     <p className="text-slate-500 text-sm">Active Loan</p>
                                     <TrendingUp size={20} className="text-blue-500"/>
                                 </div>
                                 <p className="text-3xl font-bold text-slate-900">
                                     {activeLoan ? `$${activeLoan.amount.toFixed(2)}` : '$0.00'}
                                 </p>
                                 <p className="text-xs text-slate-500 mt-2">
                                     {activeLoan ? `Borrowed on ${activeLoan.startDate}` : 'No active loan'}
                                 </p>
                             </div>

                             <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                                 <div className="flex items-center justify-between mb-2">
                                     <p className="text-slate-500 text-sm">Status</p>
                                     <UserCheck size={20} className={currentMemberUser.isActive ? "text-emerald-500" : "text-slate-400"}/>
                                 </div>
                                 <p className="text-3xl font-bold text-slate-900">{currentMemberUser.isActive ? "Active" : "Inactive"}</p>
                                 <p className="text-xs text-slate-500 mt-2">Member since {members.find(m => m.id === currentMemberUser.id)?.joinedDate || 'Unknown'}</p>
                             </div>
                         </div>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             {/* Contribution History */}
                             <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                                 <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                     <Calendar size={22} className="text-emerald-500"/> Contribution History
                                 </h3>
                                 {sortedYears.length === 0 ? (
                                     <p className="text-slate-500 text-sm">No contribution history yet.</p>
                                 ) : (
                                     <div className="space-y-3">
                                         {sortedYears.map(year => {
                                             const monthData = history[year];
                                             const monthsPaid = Object.keys(monthData).filter(month => monthData[month]).length;
                                             return (
                                                 <div key={year} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                     <div className="flex justify-between items-center">
                                                         <div>
                                                             <p className="font-bold text-slate-800">{year}</p>
                                                             <p className="text-sm text-slate-500">{monthsPaid} / 12 months paid</p>
                                                         </div>
                                                         <div className="text-right">
                                                             <p className="text-2xl font-bold text-emerald-600">${(monthsPaid * 20).toFixed(2)}</p>
                                                         </div>
                                                     </div>
                                                     <div className="grid grid-cols-6 gap-1 mt-3">
                                                         {Object.keys(monthData).map(month => (
                                                             <div key={month} className={`h-6 rounded ${monthData[month] ? 'bg-emerald-500' : 'bg-slate-200'}`} title={`${month}: ${monthData[month] ? 'Paid' : 'Unpaid'}`}></div>
                                                         ))}
                                                     </div>
                                                 </div>
                                             );
                                         })}
                                     </div>
                                 )}
                             </div>

                             {/* Recent Activity */}
                             <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                                 <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                     <TrendingUp size={22} className="text-blue-500"/> Recent Activity
                                 </h3>
                                 {memberTransactions.length === 0 ? (
                                     <p className="text-slate-500 text-sm">No transactions yet.</p>
                                 ) : (
                                     <div className="space-y-3">
                                         {memberTransactions.slice(0, 5).map(t => (
                                             <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                 <div className="flex items-center gap-3">
                                                     <div className={`p-2 rounded-lg ${t.type === 'contribution' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                                                         {t.type === 'contribution' ? <DollarSign size={18} className="text-emerald-600"/> : <TrendingUp size={18} className="text-blue-600"/>}
                                                     </div>
                                                     <div>
                                                         <p className="font-bold text-slate-800 text-sm">{t.type === 'contribution' ? 'Contribution' : 'Loan'}</p>
                                                         <p className="text-xs text-slate-500">{t.date}</p>
                                                     </div>
                                                 </div>
                                                 <p className="font-bold text-lg text-slate-800">${t.amount.toFixed(2)}</p>
                                             </div>
                                         ))}
                                     </div>
                                 )}
                             </div>
                         </div>
                     </>
                 )}

                 {/* Profile Tab */}
                 {memberTab === 'profile' && (
                     <div className="max-w-4xl mx-auto space-y-6">
                         {/* Personal Information */}
                         <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                             <div className="flex items-center justify-between mb-6">
                                 <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                     <UserCheck size={22} className="text-emerald-500"/> Personal Information
                                 </h3>
                                 <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm font-bold flex items-center gap-2">
                                     <Edit2 size={14}/> Edit Profile
                                 </button>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Full Name</label>
                                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                         <p className="font-bold text-slate-800">{currentMemberUser.name}</p>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Member ID</label>
                                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                         <p className="font-mono font-bold text-slate-800">{currentMemberUser.id}</p>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Email Address</label>
                                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                         <p className="text-slate-800">member@example.com</p>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Phone Number</label>
                                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                         <p className="text-slate-800">(555) 123-4567</p>
                                     </div>
                                 </div>

                                 <div className="md:col-span-2">
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Address</label>
                                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                         <p className="text-slate-800">123 Main Street, Apt 4B, New York, NY 10001</p>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Membership Details */}
                         <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                             <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                 <Users size={22} className="text-blue-500"/> Membership Details
                             </h3>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Member Since</label>
                                     <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                         <p className="font-bold text-blue-900">{members.find(m => m.id === currentMemberUser.id)?.joinedDate || 'Unknown'}</p>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Status</label>
                                     <div className={`p-3 rounded-lg border ${currentMemberUser.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                                         <p className={`font-bold ${currentMemberUser.isActive ? 'text-emerald-900' : 'text-slate-600'}`}>
                                             {currentMemberUser.isActive ? 'Active' : 'Inactive'}
                                         </p>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Total Contributions</label>
                                     <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                         <p className="font-bold text-emerald-900">${currentMemberUser.contribution.toFixed(2)}</p>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Beneficiary Information */}
                         <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                             <div className="flex items-center justify-between mb-6">
                                 <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                     <Heart size={22} className="text-rose-500"/> Beneficiary Information
                                 </h3>
                                 <button className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 text-sm font-bold flex items-center gap-2">
                                     <Edit2 size={14}/> Update
                                 </button>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Beneficiary Name</label>
                                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                         <p className="text-slate-800">Jane Doe</p>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Relationship</label>
                                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                         <p className="text-slate-800">Spouse</p>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Phone Number</label>
                                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                         <p className="text-slate-800">(555) 987-6543</p>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="text-sm font-medium text-slate-500 block mb-2">Email</label>
                                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                         <p className="text-slate-800">jane.doe@example.com</p>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Security Settings */}
                         <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                             <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                 <Shield size={22} className="text-purple-500"/> Security Settings
                             </h3>

                             <div className="space-y-4">
                                 <button className="w-full p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <Lock size={20} className="text-slate-500"/>
                                         <div className="text-left">
                                             <p className="font-bold text-slate-800">Change Password</p>
                                             <p className="text-xs text-slate-500">Last changed 30 days ago</p>
                                         </div>
                                     </div>
                                     <ChevronRight className="text-slate-400"/>
                                 </button>

                                 <button className="w-full p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <Shield size={20} className="text-slate-500"/>
                                         <div className="text-left">
                                             <p className="font-bold text-slate-800">Two-Factor Authentication</p>
                                             <p className="text-xs text-slate-500">Not enabled</p>
                                         </div>
                                     </div>
                                     <ChevronRight className="text-slate-400"/>
                                 </button>
                             </div>
                         </div>
                     </div>
                 )}

                 {/* Payments Tab */}
                 {memberTab === 'payments' && (
                     <div className="max-w-5xl mx-auto space-y-6">
                         {/* Quick Actions */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <button 
                                 onClick={() => { setShowPaymentModal(true); setPaymentMethod('zelle'); }}
                                 className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-white group"
                             >
                                 <div className="flex items-center justify-between mb-4">
                                     <ArrowRightLeft size={32}/>
                                     <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform"/>
                                 </div>
                                 <h4 className="text-xl font-bold mb-2">Pay with Zelle</h4>
                                 <p className="text-purple-100 text-sm">Instant transfer • Free • Easy</p>
                             </button>

                             <button 
                                 onClick={() => { setShowPaymentModal(true); setPaymentMethod('ach'); }}
                                 className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-white group"
                             >
                                 <div className="flex items-center justify-between mb-4">
                                     <Calculator size={32}/>
                                     <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform"/>
                                 </div>
                                 <h4 className="text-xl font-bold mb-2">ACH Transfer</h4>
                                 <p className="text-blue-100 text-sm">Bank transfer • Secure • 1-3 days</p>
                             </button>
                         </div>

                         {/* Payment History */}
                         <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                             <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                 <Clock size={22} className="text-emerald-500"/> Payment History
                             </h3>

                             {memberTransactions.filter(t => t.type === 'contribution').length === 0 ? (
                                 <div className="text-center py-12">
                                     <Wallet size={48} className="text-slate-300 mx-auto mb-4"/>
                                     <p className="text-slate-500 font-medium">No payments yet</p>
                                     <p className="text-sm text-slate-400 mt-2">Your payment history will appear here</p>
                                 </div>
                             ) : (
                                 <div className="space-y-3">
                                     {memberTransactions.filter(t => t.type === 'contribution').map(t => (
                                         <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                             <div className="flex items-center gap-4">
                                                 <div className="p-3 bg-emerald-100 rounded-xl">
                                                     <DollarSign size={20} className="text-emerald-600"/>
                                                 </div>
                                                 <div>
                                                     <p className="font-bold text-slate-800">Monthly Contribution</p>
                                                     <p className="text-sm text-slate-500">{t.date}</p>
                                                 </div>
                                             </div>
                                             <div className="text-right">
                                                 <p className="text-xl font-bold text-emerald-600">${t.amount.toFixed(2)}</p>
                                                 <p className="text-xs text-slate-500">Completed</p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>

                         {/* Saved Payment Methods */}
                         <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                             <div className="flex items-center justify-between mb-6">
                                 <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                     <CreditCard size={22} className="text-blue-500"/> Saved Payment Methods
                                 </h3>
                                 <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-bold flex items-center gap-2">
                                     <Plus size={14}/> Add Method
                                 </button>
                             </div>

                             <div className="space-y-3">
                                 <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                         <div className="p-3 bg-purple-200 rounded-xl">
                                             <ArrowRightLeft size={20} className="text-purple-700"/>
                                         </div>
                                         <div>
                                             <p className="font-bold text-slate-800">Zelle</p>
                                             <p className="text-sm text-slate-500">payments@millionairesclub.com</p>
                                         </div>
                                     </div>
                                     <span className="px-3 py-1 bg-purple-200 text-purple-700 rounded-full text-xs font-bold">Default</span>
                                 </div>

                                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                         <div className="p-3 bg-blue-100 rounded-xl">
                                             <Calculator size={20} className="text-blue-600"/>
                                         </div>
                                         <div>
                                             <p className="font-bold text-slate-800">ACH Transfer</p>
                                             <p className="text-sm text-slate-500">Bank Account ****1234</p>
                                         </div>
                                     </div>
                                     <button className="text-slate-400 hover:text-slate-600">
                                         <Edit2 size={16}/>
                                     </button>
                                 </div>
                             </div>
                         </div>

                         {/* Auto-Pay Settings */}
                         <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                             <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                 <RefreshCw size={22} className="text-amber-500"/> Auto-Pay Settings
                             </h3>

                             <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                                 <div className="flex items-start gap-3">
                                     <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0"/>
                                     <div>
                                         <p className="font-bold text-amber-900 mb-1">Auto-Pay Not Enabled</p>
                                         <p className="text-sm text-amber-700">Enable auto-pay to never miss a contribution. We'll automatically process your $20 monthly payment.</p>
                                     </div>
                                 </div>
                             </div>

                             <button className="w-full p-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold flex items-center justify-center gap-2">
                                 <RefreshCw size={18}/> Enable Auto-Pay
                             </button>
                         </div>
                     </div>
                 )}

                 {/* Documents Tab */}
                 {memberTab === 'documents' && (
                     <div className="max-w-4xl mx-auto space-y-6">
                         <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                             <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                 <FileText size={22} className="text-blue-500"/> My Documents
                             </h3>

                             <div className="space-y-3">
                                 <button className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-between group">
                                     <div className="flex items-center gap-4">
                                         <div className="p-3 bg-blue-100 rounded-xl">
                                             <FileText size={20} className="text-blue-600"/>
                                         </div>
                                         <div className="text-left">
                                             <p className="font-bold text-slate-800">Membership Agreement</p>
                                             <p className="text-sm text-slate-500">Signed on {members.find(m => m.id === currentMemberUser.id)?.joinedDate || 'Unknown'}</p>
                                         </div>
                                     </div>
                                     <Download className="text-slate-400 group-hover:text-blue-600"/>
                                 </button>

                                 <button className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-between group">
                                     <div className="flex items-center gap-4">
                                         <div className="p-3 bg-emerald-100 rounded-xl">
                                             <FileText size={20} className="text-emerald-600"/>
                                         </div>
                                         <div className="text-left">
                                             <p className="font-bold text-slate-800">2024 Contribution Statement</p>
                                             <p className="text-sm text-slate-500">Year-to-date summary</p>
                                         </div>
                                     </div>
                                     <Download className="text-slate-400 group-hover:text-emerald-600"/>
                                 </button>

                                 <button className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-between group">
                                     <div className="flex items-center gap-4">
                                         <div className="p-3 bg-purple-100 rounded-xl">
                                             <FileText size={20} className="text-purple-600"/>
                                         </div>
                                         <div className="text-left">
                                             <p className="font-bold text-slate-800">Tax Documents</p>
                                             <p className="text-sm text-slate-500">Forms and receipts</p>
                                         </div>
                                     </div>
                                     <Download className="text-slate-400 group-hover:text-purple-600"/>
                                 </button>

                                 {activeLoan && (
                                     <button className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-between group">
                                         <div className="flex items-center gap-4">
                                             <div className="p-3 bg-amber-100 rounded-xl">
                                                 <FileText size={20} className="text-amber-600"/>
                                             </div>
                                             <div className="text-left">
                                                 <p className="font-bold text-slate-800">Loan Agreement</p>
                                                 <p className="text-sm text-slate-500">${activeLoan.amount.toFixed(2)} • {activeLoan.startDate}</p>
                                             </div>
                                         </div>
                                         <Download className="text-slate-400 group-hover:text-amber-600"/>
                                     </button>
                                 )}
                             </div>
                         </div>

                         {/* Upload Documents */}
                         <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                             <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                 <Upload size={22} className="text-green-500"/> Upload Documents
                             </h3>
                             <p className="text-sm text-slate-500 mb-6">Upload supporting documents for loan applications or other requests</p>
                             
                             <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer">
                                 <Upload size={48} className="text-slate-400 mx-auto mb-4"/>
                                 <p className="font-bold text-slate-700 mb-2">Click to upload or drag and drop</p>
                                 <p className="text-sm text-slate-500">PDF, PNG, JPG up to 10MB</p>
                             </div>
                         </div>
                     </div>
                 )}
             </div>
        </div>
      );
  }

  // --- ADMIN LAYOUT ---
  return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      <MemberDetailPane />
      <BatchUploadModal />
      <LoanCalculatorModal />
      
      {/* Toast */}
      <div className="fixed top-6 right-6 z-[90] flex flex-col gap-3 pointer-events-none">
          {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white text-sm font-medium ${n.type === 'error' ? 'bg-red-500' : 'bg-slate-800'}`}>
              {n.message}
          </div>
          ))}
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-400 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 flex justify-between items-center">
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500 rounded-lg text-white"><Users size={20} /></div>
              Millionaires Club
              </h1>
              <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button>
          </div>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-white border-b border-slate-200 p-4 md:hidden flex justify-between items-center">
              <h1 className="font-bold text-slate-800">Millionaires Club</h1>
              <button onClick={() => setIsMobileMenuOpen(true)}><Menu size={24}/></button>
          </header>

          <div className="flex-1 p-4 md:p-10 overflow-y-auto">
              <header className="mb-6 hidden md:flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 capitalize tracking-tight">{activeTab}</h2>
                  <p className="text-slate-500 mt-1">Manage your community portfolio efficiently.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>Auto-saving to browser</span>
                </div>
              </header>
              
              {activeTab === 'dashboard' && <DashboardComponent members={members} loans={loans} transactions={transactions} setActiveTab={setActiveTab} />}
              {activeTab === 'members' && <MembersListComponent members={members} setEditingMember={setEditingMember} handleAddMember={handleAddMember} handleDeleteMember={handleDeleteMember} setShowBatchUpload={setShowBatchUpload} />}
              {activeTab === 'contributions' && <ContributionsComponent members={members} setMembers={setMembers} transactions={transactions} setTransactions={setTransactions} notify={notify} />}
              {activeTab === 'loans' && <LoansComponent members={members} setMembers={setMembers} loans={loans} setLoans={setLoans} transactions={transactions} setTransactions={setTransactions} notify={notify} checkEligibility={checkEligibility} />}
              {activeTab === 'transactions' && <TransactionHistoryComponent members={members} transactions={transactions} />}
              {activeTab === 'reports' && <ReportsComponent members={members} loans={loans} transactions={transactions} />}
              {activeTab === 'system' && <SystemView />}
          </div>
      </main>
      </div>
  );
}