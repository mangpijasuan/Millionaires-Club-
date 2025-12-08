
import React, { useState } from 'react';
import { Member, Loan, Transaction, YearlyContribution } from '../types';
import { 
  Users, LogOut, Wallet, Activity, CheckCircle, Clock, 
  TrendingUp, FileText, Settings, CreditCard, Upload, 
  User, Shield, Bell, ChevronRight, Download, Save, X, Edit2, AlertCircle, Menu, LayoutDashboard
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MemberPortalProps {
  member: Member;
  setMember: (member: Member) => void; // Local state update in App
  onUpdateProfile: (updatedMember: Member) => void; // Persistence handler
  loans: Loan[];
  transactions: Transaction[];
  history: YearlyContribution;
  onLogout: () => void;
}

const MemberPortal: React.FC<MemberPortalProps> = ({ 
  member, setMember, onUpdateProfile, loans, transactions, history, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'payments' | 'documents'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // -- Profile Edit State --
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Member>>({});
  
  // -- ACH Form State --
  const [showACHForm, setShowACHForm] = useState(false);
  const [achForm, setAchForm] = useState({ routingNumber: '', accountNumber: '', accountType: 'checking', accountHolderName: '' });
  const [achSubmitted, setAchSubmitted] = useState(false);

  // -- Derived Data --
  const activeLoan = loans.find(l => l.id === member.activeLoanId);
  const memberTransactions = transactions
    .filter(t => t.memberId === member.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Chart Data
  const chartData = transactions
    .filter(t => t.memberId === member.id && t.type === 'CONTRIBUTION')
    .slice(0, 12)
    .map(t => ({ date: new Date(t.date).toLocaleDateString(), amount: t.amount }));

  // -- Handlers --

  const handleEditClick = () => {
    setEditForm({
      email: member.email,
      phone: member.phone,
      address: member.address,
      beneficiary: member.beneficiary,
    });
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMember = { ...member, ...editForm };
    setMember(updatedMember); // Update local view immediately
    onUpdateProfile(updatedMember); // Persist to App state/storage
    setIsEditing(false);
  };

  const toggleAutoPay = () => {
    const updated = { ...member, autoPay: !member.autoPay };
    setMember(updated);
    onUpdateProfile(updated);
  };

  const handleACHSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to backend for admin to setup in QBO
    setAchSubmitted(true);
    setShowACHForm(false);
    // You could also save to member profile here
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id as any); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? 'bg-emerald-500/10 text-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.15)] border border-emerald-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-400 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 flex justify-between items-center">
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-1.5 bg-emerald-500 rounded-lg text-white"><Users size={20} /></div>
                Millionaires Club
              </h1>
              <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button>
          </div>
          
          <div className="px-8 pb-4">
             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Portal</div>
             <p className="text-sm text-slate-300">Member Access</p>
          </div>

          <nav className="p-4 space-y-1.5 flex-1">
              <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem id="profile" icon={User} label="My Profile" />
              <NavItem id="payments" icon={CreditCard} label="Payments" />
              <NavItem id="documents" icon={FileText} label="Documents" />
          </nav>

          <div className="p-6 border-t border-slate-800 space-y-4 mt-auto">
              <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg text-xs font-bold transition-colors"
              >
                  <LogOut size={14}/> Sign Out
              </button>
              <div className="flex items-center gap-3 text-sm bg-slate-800/50 p-3 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-white font-medium truncate">{member.name}</p>
                      <p className="text-xs text-slate-500 truncate">{member.id}</p>
                  </div>
              </div>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
         
         {/* Mobile Header */}
         <header className="bg-slate-900 border-b border-slate-800 p-4 md:hidden flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                  <div className="p-1 bg-emerald-500 rounded text-white"><Users size={16} /></div>
                  <span className="font-bold text-white">Millionaires Club</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-300"><Menu size={24}/></button>
         </header>

         {/* Header Title (Desktop) */}
         <header className="hidden md:flex justify-between items-center p-8 pb-0 shrink-0">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 capitalize tracking-tight">{activeTab}</h2>
                <p className="text-slate-500 mt-1">Welcome back, {member.name.split(' ')[0]}.</p>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
             
             {/* --- DASHBOARD TAB --- */}
             {activeTab === 'dashboard' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
                     {/* Summary Cards */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {/* Contribution Card */}
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                             <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                 <Wallet size={100} />
                             </div>
                             <h3 className="font-bold text-slate-500 text-xs mb-1 uppercase tracking-wider">Total Contribution</h3>
                             <p className="text-4xl font-bold text-emerald-600 tracking-tight">{formatCurrency(member.totalContribution)}</p>
                             <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                                 <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">+12%</span>
                                 <span>vs last year</span>
                             </div>
                         </div>

                         {/* Loan Card */}
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden hover:border-blue-200 transition-colors">
                             <h3 className="font-bold text-slate-500 text-xs mb-1 uppercase tracking-wider">Active Loan</h3>
                             {activeLoan ? (
                                 <div>
                                     <p className="text-4xl font-bold text-blue-600 tracking-tight">{formatCurrency(activeLoan.remainingBalance)}</p>
                                     <div className="mt-4 flex justify-between items-center">
                                         <div className="text-sm text-slate-500">
                                             Next Due: <span className="font-bold text-slate-800">{formatDate(activeLoan.nextPaymentDue)}</span>
                                         </div>
                                         <button onClick={() => setActiveTab('payments')} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100">
                                             Pay Now
                                         </button>
                                     </div>
                                 </div>
                             ) : (
                                 <div>
                                     <p className="text-4xl font-bold text-slate-300 tracking-tight">$0.00</p>
                                     <p className="text-sm text-slate-400 mt-4">No active loans. You are eligible to apply.</p>
                                 </div>
                             )}
                         </div>

                         {/* Status Card */}
                         <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                             <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                             <h3 className="font-bold text-slate-400 text-xs mb-1 uppercase tracking-wider">Membership Status</h3>
                             <div className="flex items-center gap-3 mt-2">
                                 <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400 border border-emerald-500/30">
                                     <CheckCircle size={24} />
                                 </div>
                                 <div>
                                     <p className="text-2xl font-bold">{member.accountStatus}</p>
                                     <p className="text-xs text-slate-400">Member since {new Date(member.joinDate).getFullYear()}</p>
                                 </div>
                             </div>
                             <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
                                 <span>Tier: Gold Member</span>
                                 <span>ID: {member.id}</span>
                             </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         {/* History Chart */}
                         <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                             <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                 <TrendingUp size={20} className="text-emerald-600"/> Fund Growth
                             </h3>
                             <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData.length > 0 ? chartData : [{date: 'No Data', amount: 0}]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                    <XAxis dataKey="date" hide />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val}`}/>
                                    <Tooltip 
                                      cursor={{fill: '#f8fafc'}}
                                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                      formatter={(value: number) => [`$${value}`, 'Contribution']}
                                    />
                                    <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                                  </BarChart>
                                </ResponsiveContainer>
                             </div>
                         </div>

                         {/* Recent Activity Feed */}
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                             <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                 <Clock size={20} className="text-blue-600"/> Recent Activity
                             </h3>
                             <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                                 {memberTransactions.length > 0 ? memberTransactions.slice(0, 5).map(t => (
                                     <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                         <div className={`p-2 rounded-lg shrink-0 ${t.type === 'CONTRIBUTION' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                             {t.type === 'CONTRIBUTION' ? <Wallet size={16}/> : <Activity size={16}/>}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <p className="text-sm font-bold text-slate-700 truncate">{t.type.replace('_', ' ')}</p>
                                             <p className="text-xs text-slate-400">{formatDate(t.date)}</p>
                                         </div>
                                         <span className={`text-sm font-bold whitespace-nowrap ${t.type.includes('REPAYMENT') || t.type === 'CONTRIBUTION' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                             {t.type.includes('REPAYMENT') || t.type === 'CONTRIBUTION' ? '+' : ''}{formatCurrency(t.amount)}
                                         </span>
                                     </div>
                                 )) : (
                                     <div className="text-center py-8 text-slate-400 text-sm">No recent activity.</div>
                                 )}
                             </div>
                             <button onClick={() => setActiveTab('payments')} className="mt-4 w-full py-2 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                                 View Full History <ChevronRight size={14}/>
                             </button>
                         </div>
                     </div>
                 </div>
             )}

             {/* --- PROFILE TAB --- */}
             {activeTab === 'profile' && (
                 <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                         <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                             <div>
                                 <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
                                 <p className="text-sm text-slate-500">Manage your contact details and beneficiary.</p>
                             </div>
                             {!isEditing ? (
                                 <button onClick={handleEditClick} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                                     <Edit2 size={16}/> Edit Profile
                                 </button>
                             ) : (
                                 <div className="flex gap-2">
                                     <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                                     <button onClick={handleSaveProfile} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-200">
                                         <Save size={16}/> Save Changes
                                     </button>
                                 </div>
                             )}
                         </div>
                         
                         <div className="p-8">
                             {isEditing ? (
                                 <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="space-y-1">
                                         <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                         <input 
                                            type="email" 
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={editForm.email || ''}
                                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                         />
                                     </div>
                                     <div className="space-y-1">
                                         <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                         <input 
                                            type="tel" 
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={editForm.phone || ''}
                                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                         />
                                     </div>
                                     <div className="md:col-span-2 space-y-1">
                                         <label className="text-xs font-bold text-slate-500 uppercase">Mailing Address</label>
                                         <input 
                                            type="text" 
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={editForm.address || ''}
                                            onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                         />
                                     </div>
                                     <div className="md:col-span-2 space-y-1">
                                         <label className="text-xs font-bold text-slate-500 uppercase">Beneficiary Name</label>
                                         <input 
                                            type="text" 
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={editForm.beneficiary || ''}
                                            onChange={(e) => setEditForm({...editForm, beneficiary: e.target.value})}
                                         />
                                         <p className="text-xs text-slate-400">Designated person to receive benefits in case of emergency.</p>
                                     </div>
                                 </form>
                             ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                     <div>
                                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                                         <p className="text-lg font-medium text-slate-800 mt-1">{member.name}</p>
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member ID</label>
                                         <p className="text-lg font-medium text-slate-800 mt-1 font-mono">{member.id}</p>
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                         <p className="text-lg font-medium text-slate-800 mt-1">{member.email}</p>
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                         <p className="text-lg font-medium text-slate-800 mt-1">{member.phone || 'Not provided'}</p>
                                     </div>
                                     <div className="md:col-span-2">
                                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mailing Address</label>
                                         <p className="text-lg font-medium text-slate-800 mt-1">{member.address || 'Not provided'}</p>
                                     </div>
                                     <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                                         <div className="p-2 bg-white rounded-full border border-slate-100 shadow-sm text-slate-400">
                                             <Shield size={20} />
                                         </div>
                                         <div>
                                             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Beneficiary</label>
                                             <p className="text-lg font-bold text-slate-800 mt-1">{member.beneficiary || 'None Designated'}</p>
                                         </div>
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>

                     {/* Security / Account Settings Placeholder */}
                     <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex justify-between items-center">
                         <div>
                             <h3 className="font-bold text-slate-800">Security Settings</h3>
                             <p className="text-sm text-slate-500">Update password and 2FA settings.</p>
                         </div>
                         <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Manage</button>
                     </div>
                 </div>
             )}

             {/* --- PAYMENTS TAB --- */}
             {activeTab === 'payments' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
                     {/* Make Payment Section */}
                     <div className="lg:col-span-2 space-y-6">
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                             <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                                 <CreditCard size={20} className="text-blue-600"/> Make a Payment
                             </h3>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                 {/* Zelle Option */}
                                 <div className="p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group">
                                     <div className="flex items-center gap-3 mb-2">
                                         <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">Z</div>
                                         <span className="font-bold text-slate-700">Zelle</span>
                                     </div>
                                     <p className="text-sm text-slate-600 mb-2">Send payment to:</p>
                                     <p className="font-mono text-sm font-bold text-slate-800 bg-white p-2 rounded border border-slate-200 text-center select-all">payments@millionairesclub.com</p>
                                     <p className="text-xs text-slate-400 mt-2">Scan QR code available in Documents.</p>
                                 </div>

                                 {/* ACH Option */}
                                 <div className="p-4 border border-slate-200 rounded-xl">
                                     <div className="flex items-center gap-3 mb-2">
                                         <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">ACH</div>
                                         <span className="font-bold text-slate-700">Bank Transfer (ACH)</span>
                                     </div>
                                     {achSubmitted ? (
                                         <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-2">
                                             <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                                                 <CheckCircle size={16}/> ACH info submitted! Admin will set up auto-debit.
                                             </p>
                                         </div>
                                     ) : !showACHForm ? (
                                         <>
                                             <p className="text-sm text-slate-600">Link your bank account for automatic monthly deductions via QuickBooks.</p>
                                             <button 
                                                 onClick={() => setShowACHForm(true)}
                                                 className="mt-3 w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                                             >
                                                 Setup ACH Direct Debit
                                             </button>
                                         </>
                                     ) : (
                                         <form onSubmit={handleACHSubmit} className="mt-3 space-y-3">
                                             <div>
                                                 <label className="text-xs font-bold text-slate-500 uppercase">Account Holder Name</label>
                                                 <input 
                                                     type="text" 
                                                     required
                                                     placeholder="John Doe"
                                                     value={achForm.accountHolderName}
                                                     onChange={(e) => setAchForm({...achForm, accountHolderName: e.target.value})}
                                                     className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                 />
                                             </div>
                                             <div>
                                                 <label className="text-xs font-bold text-slate-500 uppercase">Routing Number</label>
                                                 <input 
                                                     type="text" 
                                                     required
                                                     placeholder="9 digits"
                                                     maxLength={9}
                                                     pattern="[0-9]{9}"
                                                     value={achForm.routingNumber}
                                                     onChange={(e) => setAchForm({...achForm, routingNumber: e.target.value.replace(/\D/g, '')})}
                                                     className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                                                 />
                                             </div>
                                             <div>
                                                 <label className="text-xs font-bold text-slate-500 uppercase">Account Number</label>
                                                 <input 
                                                     type="text" 
                                                     required
                                                     placeholder="Account number"
                                                     value={achForm.accountNumber}
                                                     onChange={(e) => setAchForm({...achForm, accountNumber: e.target.value.replace(/\D/g, '')})}
                                                     className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                                                 />
                                             </div>
                                             <div>
                                                 <label className="text-xs font-bold text-slate-500 uppercase">Account Type</label>
                                                 <select 
                                                     value={achForm.accountType}
                                                     onChange={(e) => setAchForm({...achForm, accountType: e.target.value})}
                                                     className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                 >
                                                     <option value="checking">Checking</option>
                                                     <option value="savings">Savings</option>
                                                 </select>
                                             </div>
                                             <div className="flex gap-2 pt-2">
                                                 <button 
                                                     type="button"
                                                     onClick={() => setShowACHForm(false)}
                                                     className="flex-1 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
                                                 >
                                                     Cancel
                                                 </button>
                                                 <button 
                                                     type="submit"
                                                     className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                                                 >
                                                     Submit for Setup
                                                 </button>
                                             </div>
                                             <p className="text-xs text-slate-400 text-center">Your bank info will be securely sent to admin for QBO setup.</p>
                                         </form>
                                     )}
                                 </div>
                             </div>

                             {/* Auto-Pay Toggle */}
                             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                 <div className="flex items-center gap-3">
                                     <div className={`p-2 rounded-full ${member.autoPay ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                         <Clock size={20} />
                                     </div>
                                     <div>
                                         <p className="font-bold text-slate-800 text-sm">Auto-Pay Enrollment</p>
                                         <p className="text-xs text-slate-500">Automatically deduct monthly dues on the 10th.</p>
                                     </div>
                                 </div>
                                 <button 
                                    onClick={toggleAutoPay}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${member.autoPay ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                 >
                                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${member.autoPay ? 'translate-x-6' : 'translate-x-1'}`}/>
                                 </button>
                             </div>
                         </div>

                         {/* Payment History */}
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                             <h3 className="font-bold text-lg text-slate-800 mb-4">Payment History</h3>
                             <div className="overflow-hidden">
                                 <table className="w-full text-sm text-left">
                                     <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                         <tr>
                                             <th className="px-4 py-3">Date</th>
                                             <th className="px-4 py-3">Type</th>
                                             <th className="px-4 py-3 text-right">Amount</th>
                                             <th className="px-4 py-3 text-right">Status</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-100">
                                         {memberTransactions.map(t => (
                                             <tr key={t.id} className="hover:bg-slate-50">
                                                 <td className="px-4 py-3 text-slate-600">{formatDate(t.date)}</td>
                                                 <td className="px-4 py-3">
                                                     <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                                         t.type === 'CONTRIBUTION' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                         t.type === 'LOAN_REPAYMENT' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                         'bg-slate-50 text-slate-600 border-slate-200'
                                                     }`}>
                                                         {t.type.replace('_', ' ')}
                                                     </span>
                                                 </td>
                                                 <td className="px-4 py-3 text-right font-medium text-slate-800">{formatCurrency(t.amount)}</td>
                                                 <td className={`px-4 py-3 text-right text-xs font-bold uppercase ${
                                                     t.status === 'completed' ? 'text-emerald-600' :
                                                     t.status === 'failed' ? 'text-red-600' : 'text-amber-500'
                                                 }`}>
                                                     {t.status || 'Completed'}
                                                 </td>
                                             </tr>
                                         ))}
                                         {memberTransactions.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400">No history available.</td></tr>}
                                     </tbody>
                                 </table>
                             </div>
                         </div>
                     </div>

                     {/* Right Sidebar: Payment Status & Summary */}
                     <div className="space-y-6">
                         <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white">
                             <p className="text-xs text-slate-400 uppercase font-bold mb-4">Payment Status</p>
                             {achSubmitted ? (
                                 <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 mb-4">
                                     <div className="flex items-center gap-2 text-emerald-400 mb-1">
                                         <CheckCircle size={16}/>
                                         <span className="text-sm font-bold">ACH Setup Pending</span>
                                     </div>
                                     <p className="text-xs text-slate-400">Admin will configure auto-debit in QuickBooks.</p>
                                 </div>
                             ) : (
                                 <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-4">
                                     <p className="text-sm text-slate-300">No payment method linked yet.</p>
                                     <p className="text-xs text-slate-500 mt-1">Setup ACH to enable auto-pay.</p>
                                 </div>
                             )}
                             <div className="text-xs text-slate-500">
                                 <p>Questions? Contact admin at:</p>
                                 <p className="text-slate-300 font-medium">admin@millionairesclub.com</p>
                             </div>
                         </div>

                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                             <h4 className="font-bold text-slate-800 mb-4">Upcoming Dues</h4>
                             {activeLoan ? (
                                 <div className="space-y-3">
                                     <div className="flex justify-between items-center text-sm">
                                         <span className="text-slate-600">Loan Repayment</span>
                                         <span className="font-bold text-slate-800">${(activeLoan.originalAmount / activeLoan.termMonths).toFixed(2)}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-sm">
                                         <span className="text-slate-600">Contribution</span>
                                         <span className="font-bold text-slate-800">$20.00</span>
                                     </div>
                                     <div className="pt-3 border-t border-slate-100 flex justify-between items-center font-bold">
                                         <span className="text-slate-800">Total Due</span>
                                         <span className="text-emerald-600">${(20 + activeLoan.originalAmount / activeLoan.termMonths).toFixed(2)}</span>
                                     </div>
                                     <p className="text-xs text-slate-400 text-right mt-1">Due Date: {formatDate(activeLoan.nextPaymentDue)}</p>
                                 </div>
                             ) : (
                                 <div className="space-y-3">
                                     <div className="flex justify-between items-center text-sm">
                                         <span className="text-slate-600">Contribution</span>
                                         <span className="font-bold text-slate-800">$20.00</span>
                                     </div>
                                     <div className="pt-3 border-t border-slate-100 flex justify-between items-center font-bold">
                                         <span className="text-slate-800">Total Due</span>
                                         <span className="text-emerald-600">$20.00</span>
                                     </div>
                                     <p className="text-xs text-slate-400 text-right mt-1">Due Date: 10th of Month</p>
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>
             )}

             {/* --- DOCUMENTS TAB --- */}
             {activeTab === 'documents' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                 <FileText size={20} className="text-slate-600"/> Documents
                             </h3>
                             <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
                                 <Upload size={16}/> Upload New
                             </button>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {[
                                 { name: 'Membership Agreement', date: '2023-01-15', size: '1.2 MB', type: 'PDF' },
                                 { name: 'Loan Contract 2024', date: '2024-05-10', size: '850 KB', type: 'PDF' },
                                 { name: 'Annual Statement 2024', date: '2025-01-01', size: '2.4 MB', type: 'PDF' },
                                 { name: 'Policy Handbook v2', date: '2023-06-20', size: '3.1 MB', type: 'PDF' },
                             ].map((doc, i) => (
                                 <div key={i} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer bg-slate-50">
                                     <div className="flex justify-between items-start mb-3">
                                         <div className="p-2 bg-white rounded-lg border border-slate-100 text-red-500">
                                             <FileText size={24} />
                                         </div>
                                         <button className="text-slate-400 hover:text-slate-600">
                                             <Download size={18} />
                                         </button>
                                     </div>
                                     <h4 className="font-bold text-slate-800 text-sm truncate">{doc.name}</h4>
                                     <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                                         <span>{doc.date}</span>
                                         <span>{doc.size}</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
             )}

         </div>
      </main>
    </div>
  );
};

export default MemberPortal;
