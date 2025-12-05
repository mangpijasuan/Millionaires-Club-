import React, { useState } from 'react';
import { Member, Loan, Transaction } from '../types';
import { Users, Wallet, CreditCard, TrendingUp, DollarSign, AlertCircle, Calendar, UserCheck, UserX, ChevronRight, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  members: Member[];
  loans: Loan[];
  transactions: Transaction[];
  setActiveTab: (tab: string) => void;
}

const DashboardComponent: React.FC<DashboardProps> = ({ members, loans, transactions, setActiveTab }) => {
  const totalMembers = members.length;
  const activeMembersCount = members.filter(m => m.accountStatus === 'Active').length;
  const inactiveMembersCount = members.filter(m => m.accountStatus === 'Inactive').length;
  
  const totalFunds = members.reduce((sum, m) => sum + m.totalContribution, 0);
  const totalLoaned = loans.filter(l => l.status === 'ACTIVE').reduce((sum, l) => sum + l.originalAmount, 0);
  const activeLoanCount = loans.filter(l => l.status === 'ACTIVE').length;

  // --- Chart Data (Last 6 months contributions) ---
  const chartData = transactions
    .filter(t => t.type === 'CONTRIBUTION')
    .slice(0, 50) 
    .map(t => ({ date: new Date(t.date).toLocaleDateString(), amount: t.amount }));

  // --- Loan Dues Logic ---
  const activeLoans = loans
    .filter(l => l.status === 'ACTIVE')
    .sort((a, b) => new Date(a.nextPaymentDue).getTime() - new Date(b.nextPaymentDue).getTime());

  // --- Contribution Dues Logic ---
  const date = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  const currentMonthName = date.toLocaleString('default', { month: 'long' });

  // Get IDs of members who have paid at least once this month
  const paidMemberIds = new Set(transactions
    .filter(t => {
        const d = new Date(t.date);
        return t.type === 'CONTRIBUTION' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .map(t => t.memberId)
  );

  const unpaidMembers = members.filter(m => m.accountStatus === 'Active' && !paidMemberIds.has(m.id));

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 1. Top Stats / Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div 
            onClick={() => setActiveTab('members')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Members</p>
                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{totalMembers}</h3>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors"><Users size={20}/></div>
            </div>
        </div>

        {/* Active Members */}
        <div 
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Active Members</p>
                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{activeMembersCount}</h3>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors"><UserCheck size={20}/></div>
            </div>
        </div>

        {/* Inactive Members */}
        <div 
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-red-300 hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Inactive Members</p>
                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-red-600 transition-colors">{inactiveMembersCount}</h3>
                </div>
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors"><UserX size={20}/></div>
            </div>
        </div>

        {/* Total Funds */}
        <div 
            onClick={() => setActiveTab('contributions')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Funds</p>
                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors">${totalFunds.toLocaleString()}</h3>
                </div>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors"><Wallet size={20}/></div>
            </div>
        </div>
      </div>

      {/* 2. Dues & Action Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Loan Payments Due */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-96">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Calendar size={18} className="text-blue-600"/> Loan Payment Dues
                  </h3>
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{activeLoans.length} Active</span>
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100 sticky top-0 z-10">
                          <tr>
                              <th className="px-5 py-3 bg-slate-50">Borrower</th>
                              <th className="px-5 py-3 bg-slate-50">Due Date</th>
                              <th className="px-5 py-3 bg-slate-50 text-right">Min. Due</th>
                              <th className="px-5 py-3 bg-slate-50 text-right">Balance</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {activeLoans.map(loan => {
                              const borrower = members.find(m => m.id === loan.borrowerId);
                              const dueDate = new Date(loan.nextPaymentDue);
                              const isOverdue = new Date() > dueDate;
                              const monthlyDue = loan.originalAmount / loan.termMonths;

                              return (
                                  <tr key={loan.id} className="hover:bg-blue-50/50 transition-colors">
                                      <td className="px-5 py-3">
                                          <div className="font-medium text-slate-800">{borrower?.name || loan.borrowerId}</div>
                                          <div className="text-xs text-slate-400">{loan.id}</div>
                                      </td>
                                      <td className="px-5 py-3">
                                          <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                                              {isOverdue && <AlertCircle size={14}/>}
                                              {dueDate.toLocaleDateString()}
                                          </div>
                                          {isOverdue && <div className="text-[10px] text-red-500">Late Fee Applies</div>}
                                      </td>
                                      <td className="px-5 py-3 text-right font-medium text-slate-700">
                                          ${monthlyDue.toFixed(2)}
                                      </td>
                                      <td className="px-5 py-3 text-right font-bold text-blue-600">
                                          ${loan.remainingBalance.toLocaleString()}
                                      </td>
                                  </tr>
                              );
                          })}
                          {activeLoans.length === 0 && (
                              <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No active loans pending.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
              <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                  <button onClick={() => setActiveTab('loans')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1">
                      Manage Loans <ChevronRight size={14}/>
                  </button>
              </div>
          </div>

          {/* Right: Monthly Contribution Dues */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-96">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <AlertCircle size={18} className="text-amber-500"/> Pending Contributions
                  </h3>
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">{currentMonthName}</span>
              </div>
              
              <div className="px-5 py-3 border-b border-slate-100 bg-white flex justify-between items-center text-xs text-slate-500">
                   <span><strong>{unpaidMembers.length}</strong> members have not paid this month.</span>
                   <div className="flex gap-2">
                       <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Paid</span>
                       <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending</span>
                   </div>
              </div>

              <div className="flex-1 overflow-y-auto p-0">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100 sticky top-0 z-10">
                           <tr>
                               <th className="px-5 py-3 bg-slate-50">Member Name</th>
                               <th className="px-5 py-3 bg-slate-50">ID</th>
                               <th className="px-5 py-3 bg-slate-50 text-right">Action</th>
                           </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {unpaidMembers.slice(0, 50).map(member => (
                              <tr key={member.id} className="hover:bg-amber-50/50 transition-colors">
                                  <td className="px-5 py-2.5 font-medium text-slate-700">{member.name}</td>
                                  <td className="px-5 py-2.5 font-mono text-xs text-slate-400">{member.id}</td>
                                  <td className="px-5 py-2.5 text-right">
                                      <button 
                                        onClick={() => setActiveTab('contributions')}
                                        className="text-[10px] font-bold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                      >
                                          Record Pay
                                      </button>
                                  </td>
                              </tr>
                          ))}
                          {unpaidMembers.length === 0 && (
                              <tr><td colSpan={3} className="p-8 text-center text-emerald-500 font-medium"><CheckCircle size={32} className="mx-auto mb-2"/> All active members have paid for {currentMonthName}!</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
              {unpaidMembers.length > 50 && (
                  <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
                      Showing first 50 of {unpaidMembers.length} pending
                  </div>
              )}
          </div>

      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500"/> Fund Growth (6 Months)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="date" hide />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val}`}/>
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`$${value}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats / Liquidity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Liquidity Overview</h3>
            <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs uppercase font-bold text-slate-500 mb-1">Available to Lend</p>
                    <p className="text-3xl font-bold text-slate-800">${(totalFunds - totalLoaned).toLocaleString()}</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${((totalFunds - totalLoaned) / totalFunds) * 100}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-right">{(((totalFunds - totalLoaned) / totalFunds) * 100).toFixed(1)}% of total funds</p>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Active Loans Value</span>
                    <span className="font-bold text-blue-600">${totalLoaned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Avg. Loan Size</span>
                    <span className="font-bold text-slate-800">${activeLoanCount > 0 ? (totalLoaned / activeLoanCount).toLocaleString(undefined, {maximumFractionDigits:0}) : 0}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;
