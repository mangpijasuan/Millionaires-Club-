import React, { useState, useRef, useEffect } from 'react';
import { Member, Loan, Transaction } from '../types';
import { AlertCircle, CheckCircle, CreditCard, X, DollarSign, Clock, Calendar, Printer, History, Search, ChevronDown, Check, UserPlus, AlertTriangle, FileText, Wallet } from 'lucide-react';

interface LoansProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  loans: Loan[];
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  checkEligibility: (id: string) => { eligible: boolean; reason?: string; limit?: number };
}

const LoansComponent: React.FC<LoansProps> = ({ members, setMembers, loans, setLoans, transactions, setTransactions, notify, checkEligibility }) => {
  const [borrowerId, setBorrowerId] = useState('');
  const [cosignerId, setCosignerId] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [term, setTerm] = useState(12);
  const [feeType, setFeeType] = useState<'upfront' | 'capitalized'>('upfront');

  // Searchable Dropdown State for Borrower
  const [borrowerSearch, setBorrowerSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Searchable Dropdown State for Cosigner
  const [cosignerSearch, setCosignerSearch] = useState('');
  const [isCosignerDropdownOpen, setIsCosignerDropdownOpen] = useState(false);
  const cosignerDropdownRef = useRef<HTMLDivElement>(null);

  // Repayment Modal State
  const [repaymentLoan, setRepaymentLoan] = useState<Loan | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  // New Repayment Fields
  const [repayMethod, setRepayMethod] = useState('Cash');
  const [repayReceivedBy, setRepayReceivedBy] = useState('Nangpi');

  // Schedule Modal State
  const [scheduleLoan, setScheduleLoan] = useState<Loan | null>(null);

  const eligibility = borrowerId ? checkEligibility(borrowerId) : null;
  const recentRepayments = transactions.filter(t => t.type === 'LOAN_REPAYMENT').slice(0, 5);

  // Handle Click Outside for Dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (cosignerDropdownRef.current && !cosignerDropdownRef.current.contains(event.target as Node)) {
        setIsCosignerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMembers = members.filter(m => 
    m.accountStatus === 'Active' && (
      m.name.toLowerCase().includes(borrowerSearch.toLowerCase()) || 
      m.id.toLowerCase().includes(borrowerSearch.toLowerCase())
    )
  );

  // Filter cosigners: Must be Active, NOT the borrower, and matches search
  const filteredCosigners = members.filter(m => 
    m.accountStatus === 'Active' && 
    m.id !== borrowerId &&
    (
      m.name.toLowerCase().includes(cosignerSearch.toLowerCase()) || 
      m.id.toLowerCase().includes(cosignerSearch.toLowerCase())
    )
  );

  const handleSelectBorrower = (member: Member) => {
    setBorrowerId(member.id);
    setBorrowerSearch(member.name);
    setIsDropdownOpen(false);
    // Reset cosigner if it matches the new borrower
    if (cosignerId === member.id) {
        setCosignerId('');
        setCosignerSearch('');
    }
  };

  const handleSelectCosigner = (member: Member) => {
    setCosignerId(member.id);
    setCosignerSearch(member.name);
    setIsCosignerDropdownOpen(false);
  };

  // 2024 Policy Fee Calculation
  const calculateApplicationFee = (amount: number, months: number) => {
    if (amount < 2500) {
        return 30; // Under $2500 (Usually 12 months)
    } else {
        // Between $2501 and $5000
        return months === 24 ? 70 : 50; 
    }
  };

  const createLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibility?.eligible) {
      notify("Member not eligible for this loan.", "error");
      return;
    }
    
    if (!cosignerId) {
      notify("A cosigner is required for all loans.", "error");
      return;
    }

    const requestedAmount = parseFloat(loanAmount);
    if (isNaN(requestedAmount) || requestedAmount > (eligibility.limit || 0)) {
       notify("Invalid amount or exceeds limit.", "error");
       return;
    }

    // Calculate Application Fee
    const appFee = calculateApplicationFee(requestedAmount, term);

    // Determine Final Loan Principal based on Fee Type
    let finalPrincipal = requestedAmount;
    if (feeType === 'capitalized') {
        finalPrincipal += appFee;
    }

    // Calculate first due date: 10th of the next month
    const now = new Date();
    const nextDue = new Date(now.getFullYear(), now.getMonth() + 1, 10);

    const newLoan: Loan = {
      id: Math.random().toString(36).substr(2, 9),
      borrowerId,
      cosignerId: cosignerId,
      originalAmount: finalPrincipal,
      remainingBalance: finalPrincipal,
      termMonths: term,
      status: 'ACTIVE',
      startDate: new Date().toISOString(),
      nextPaymentDue: nextDue.toISOString()
    };

    setLoans([newLoan, ...loans]);
    setMembers(members.map(m => m.id === borrowerId ? { ...m, activeLoanId: newLoan.id } : m));
    
    // Create Transactions: Disbursal AND Fee
    const newTransactions = [
        { 
            id: Math.random().toString(36).substr(2, 9), 
            memberId: borrowerId, 
            type: 'LOAN_DISBURSAL' as const, 
            amount: requestedAmount, 
            date: new Date().toISOString(), 
            description: 'Loan Disbursal' 
        },
        {
            id: Math.random().toString(36).substr(2, 9),
            memberId: borrowerId,
            type: 'FEE' as const,
            amount: appFee,
            date: new Date().toISOString(),
            description: feeType === 'capitalized' 
                ? `Application Fee (${term} Mo) - Added to Principal` 
                : `Application Fee (${term} Mo) - Paid Upfront`
        },
        ...transactions
    ];
    setTransactions(newTransactions);
    
    const successMsg = feeType === 'capitalized' 
        ? `Loan issued! $${appFee} fee added to principal.` 
        : `Loan issued! Please collect $${appFee} fee upfront.`;
    
    notify(successMsg);
    setBorrowerId('');
    setBorrowerSearch('');
    setCosignerId('');
    setCosignerSearch('');
    setLoanAmount('');
    setFeeType('upfront');
  };

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaymentLoan || !repayAmount) return;
    
    const amount = parseFloat(repayAmount);
    if (isNaN(amount) || amount <= 0) {
        notify("Please enter a valid amount.", "error");
        return;
    }
    
    // Calculate if late fee applies to check balance cap
    const now = new Date();
    const dueDate = new Date(repaymentLoan.nextPaymentDue);
    const isLate = now > dueDate;
    const lateFee = isLate ? 5.00 : 0;

    // Allow payment up to balance + potential late fee
    if (amount > (repaymentLoan.remainingBalance + lateFee + 0.01)) { 
        notify("Amount exceeds remaining balance (including fees).", "error");
        return;
    }

    repayLoan(repaymentLoan.id, amount, repayMethod, repayReceivedBy);
    setRepaymentLoan(null);
    setRepayAmount('');
    setRepayMethod('Cash'); // Reset to default
    setRepayReceivedBy('Nangpi'); // Reset to default
  };

  const repayLoan = (loanId: string, amount: number, method: string, receiver: string) => {
     const loan = loans.find(l => l.id === loanId);
     if (!loan) return;

     // Late Fee Logic
     const now = new Date();
     const dueDate = new Date(loan.nextPaymentDue);
     const isLate = now > dueDate;
     const lateFee = isLate ? 5.00 : 0;
     
     const newTransactions = [...transactions];
     
     if (isLate) {
         newTransactions.unshift({
             id: Math.random().toString(36).substr(2, 9),
             memberId: loan.borrowerId,
             type: 'FEE',
             amount: 5.00,
             date: new Date().toISOString(),
             description: 'Late Fee: Missed Payment Due Date'
         });
     }

     // Calculate new balance: Current + Fee - Repayment
     let newBalance = loan.remainingBalance + lateFee - amount;
     if (newBalance < 0.01) newBalance = 0;
     
     const newStatus = newBalance === 0 ? 'PAID' : 'ACTIVE';

     let updatedNextPaymentDue = loan.nextPaymentDue;
     if (newStatus === 'ACTIVE') {
         // Increment due date by 1 month, keeping it on the 10th
         const currentDueDate = new Date(loan.nextPaymentDue);
         const targetYear = currentDueDate.getFullYear();
         const targetMonth = currentDueDate.getMonth() + 1; // Next month
         const nextDate = new Date(targetYear, targetMonth, 10);
         updatedNextPaymentDue = nextDate.toISOString();
     }

     setLoans(loans.map(l => l.id === loanId ? { 
         ...l, 
         remainingBalance: newBalance, 
         status: newStatus,
         nextPaymentDue: updatedNextPaymentDue
     } : l));
     
     newTransactions.unshift({ 
         id: Math.random().toString(36).substr(2, 9), 
         memberId: loan.borrowerId, 
         type: 'LOAN_REPAYMENT', 
         amount: amount, 
         date: new Date().toISOString(), 
         description: 'Loan Repayment',
         paymentMethod: method,
         receivedBy: receiver
     });
     
     setTransactions(newTransactions);

     if (newStatus === 'PAID') {
       setMembers(members.map(m => m.id === loan.borrowerId ? { ...m, activeLoanId: null, lastLoanPaidDate: new Date().toISOString() } : m));
       notify("Loan fully paid off!", "success");
     } else {
       const msg = isLate 
           ? `Repayment recorded with $5.00 Late Fee. Next due: ${new Date(updatedNextPaymentDue).toLocaleDateString()}`
           : `Repayment recorded. Next due: ${new Date(updatedNextPaymentDue).toLocaleDateString()}`;
       notify(msg, isLate ? 'info' : 'success');
     }
  };

  // Schedule Logic
  const generateLoanSchedule = (loan: Loan) => {
    const startDate = new Date(loan.startDate);
    const monthlyPayment = loan.originalAmount / loan.termMonths;
    const schedule = [];
    
    // Get repayments for this loan context
    const repayments = transactions
        .filter(t => t.type === 'LOAN_REPAYMENT' && t.memberId === loan.borrowerId && new Date(t.date) > new Date(loan.startDate))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalPaid = 0;

    for (let i = 1; i <= loan.termMonths; i++) {
        // Due date is 10th of subsequent months
        const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 10);
        
        // Map actual payments sequentially
        const payment = repayments[i-1];
        const actualAmount = payment ? payment.amount : null;
        if (actualAmount) totalPaid += actualAmount;

        schedule.push({
            number: i,
            dueDate: dueDate,
            estimated: monthlyPayment,
            actual: actualAmount,
            actualDate: payment ? new Date(payment.date) : null
        });
    }
    return { schedule, totalPaid };
  };

  const LoanScheduleModal = () => {
      if (!scheduleLoan) return null;
      
      const borrower = members.find(m => m.id === scheduleLoan.borrowerId);
      const { schedule, totalPaid } = generateLoanSchedule(scheduleLoan);
      
      const handlePrint = () => {
          const printContent = document.getElementById('print-schedule');
          if (!printContent) return;
          
          const win = window.open('', '', 'height=900,width=800');
          win?.document.write('<html><head><title>Loan Schedule</title>');
          win?.document.write('<script src="https://cdn.tailwindcss.com"></script>'); 
          win?.document.write(`
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
              body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; }
              @media print {
                body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                @page { margin: 0.5cm; }
              }
              .header-bar { background-color: #3b82f6 !important; color: white !important; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            </style>
          `);
          win?.document.write('</head><body>');
          win?.document.write(printContent.innerHTML);
          win?.document.write('</body></html>');
          win?.document.close();
          setTimeout(() => { win?.print(); }, 500);
      };

      return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-blue-600"/> Loan Payment Schedule</h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                            <Printer size={16}/> Print PDF
                        </button>
                        <button onClick={() => setScheduleLoan(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20}/></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
                    <div id="print-schedule" className="bg-white p-8 max-w-3xl mx-auto shadow-sm border border-slate-200">
                        <div className="header-bar bg-blue-500 text-white text-center font-bold text-2xl py-2 mb-6">Loan Payment</div>
                        <div className="flex justify-between items-start mb-6">
                             <div className="w-1/2">
                                 <div className="bg-blue-400 text-white px-2 py-1 font-bold text-sm">Borrower's Information:</div>
                                 <div className="border border-blue-200 p-3 bg-blue-50/30">
                                     <div className="flex gap-2 mb-1"><span className="font-bold text-sm min-w-[80px]">Borrower:</span> <span className="text-sm border-b border-dotted border-slate-400 flex-1">{borrower?.name}</span></div>
                                     <div className="flex gap-2"><span className="font-bold text-sm min-w-[80px]">Cosigner:</span> <span className="text-sm border-b border-dotted border-slate-400 flex-1">{scheduleLoan.cosignerId ? members.find(m => m.id === scheduleLoan.cosignerId)?.name : 'N/A'}</span></div>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <div className="text-red-900 text-2xl font-bold font-serif">Millionaires Club</div>
                                 <div className="text-blue-400 text-xs tracking-[0.2em] uppercase font-bold my-1">Financial Services</div>
                                 <div className="text-emerald-600 text-xs">info.millionaresclubusa@gmail.com</div>
                             </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8 mb-6">
                            <div>
                                <div className="bg-slate-500 text-white px-2 py-1 font-bold text-sm">Loan Information</div>
                                <div className="border border-slate-300">
                                    <div className="flex justify-between p-2 border-b border-slate-200 text-sm">
                                        <span className="font-bold">Loan Period In Months</span>
                                        <span className="font-mono">{scheduleLoan.termMonths}</span>
                                    </div>
                                    <div className="flex justify-between p-2 border-b border-slate-200 text-sm">
                                        <span className="font-bold">Loan Issue Date</span>
                                        <span className="font-mono">{new Date(scheduleLoan.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between p-2 text-sm bg-white">
                                        <span className="font-bold">Loan Amount:</span>
                                        <span className="font-mono font-bold">${scheduleLoan.originalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="bg-slate-500 text-white px-2 py-1 font-bold text-sm">Summary To Date</div>
                                <div className="border border-slate-300 bg-slate-100">
                                    <div className="flex justify-between p-2 border-b border-slate-300 text-sm">
                                        <span className="font-bold">Total Payment</span>
                                        <span className="font-mono">${totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                    </div>
                                    <div className="flex justify-between p-2 border-b border-slate-300 text-sm">
                                        <span className="font-bold">Principal Balance</span>
                                        <span className="font-mono">${scheduleLoan.remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                    </div>
                                    <div className="flex justify-between p-2 text-sm">
                                        <span className="font-bold">Payment Number</span>
                                        <span className="font-mono">{Math.ceil(totalPaid / (scheduleLoan.originalAmount/scheduleLoan.termMonths))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2 border-b-2 border-blue-400 pb-1 inline-block">Payment Schedules</h4>
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-blue-500 text-white print:bg-blue-500">
                                    <th className="p-2 text-left w-24 border border-blue-400">Payment Number</th>
                                    <th className="p-2 text-left border border-blue-400">Date</th>
                                    <th className="p-2 text-right border border-blue-400">Estimated Payment</th>
                                    <th className="p-2 text-right border border-blue-400">Actual Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((row, idx) => (
                                    <tr key={row.number} className={idx % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'}>
                                        <td className="p-2 border border-blue-100">Pmt # {row.number}</td>
                                        <td className="p-2 border border-blue-100">{row.dueDate.toLocaleDateString()}</td>
                                        <td className="p-2 border border-blue-100 text-right font-mono">${row.estimated.toFixed(2)}</td>
                                        <td className="p-2 border border-blue-100 text-right font-bold">
                                            {row.actual ? `$${row.actual.toLocaleString(undefined, {minimumFractionDigits: 2})}` : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <LoanScheduleModal />
      
      {/* Repayment Modal */}
      {repaymentLoan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
             <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg text-slate-800">Record Repayment</h3>
                     <button onClick={() => setRepaymentLoan(null)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                 </div>
                 
                 {(() => {
                     const monthlyPayment = repaymentLoan.originalAmount / repaymentLoan.termMonths;
                     const now = new Date();
                     const dueDate = new Date(repaymentLoan.nextPaymentDue);
                     const isLate = now > dueDate;

                     return (
                         <>
                             {isLate && (
                                 <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                                     <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                     <div>
                                         <p className="text-xs font-bold text-red-700">Payment Overdue</p>
                                         <p className="text-xs text-red-600">A late fee of <strong>$5.00</strong> will be applied to the balance.</p>
                                     </div>
                                 </div>
                             )}

                             <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                                 <div className="flex justify-between items-center">
                                     <span className="text-xs font-bold text-slate-500 uppercase">Current Balance</span>
                                     <span className="text-lg font-bold text-blue-600">${repaymentLoan.remainingBalance.toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                     <span className="text-xs text-slate-500">Min. Monthly Payment</span>
                                     <span className="text-sm font-medium text-slate-700">${monthlyPayment.toFixed(2)}</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                     <span className="text-xs text-slate-500">Due Date</span>
                                     <span className={`text-sm font-medium ${isLate ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                                         {dueDate.toLocaleDateString()}
                                     </span>
                                 </div>
                             </div>
                         </>
                     );
                 })()}

                 <form onSubmit={handleRepaySubmit} className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Repayment Amount</label>
                         <div className="relative">
                             <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                             <input 
                                type="number" 
                                autoFocus
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="0.00"
                                value={repayAmount}
                                onChange={(e) => setRepayAmount(e.target.value)}
                                max={repaymentLoan.remainingBalance + 5} 
                                step="0.01"
                                required
                             />
                         </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Method</label>
                             <select 
                               className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                               value={repayMethod}
                               onChange={(e) => setRepayMethod(e.target.value)}
                             >
                                 <option value="Cash">Cash</option>
                                 <option value="Check">Check</option>
                                 <option value="Zelle">Zelle</option>
                                 <option value="Bank Transfer">Bank</option>
                                 <option value="Auto-pay">Auto-pay</option>
                             </select>
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Received By</label>
                             <select 
                               className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                               value={repayReceivedBy}
                               onChange={(e) => setRepayReceivedBy(e.target.value)}
                             >
                                 <option value="Nangpi">Nangpi</option>
                                 <option value="Pu Tuang">Pu Tuang</option>
                                 <option value="Mangpi">Mangpi</option>
                                 <option value="Muan">Muan</option>
                                 <option value="John Tuang">John Tuang</option>
                                 <option value="Bank">Bank</option>
                             </select>
                         </div>
                     </div>

                     <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-colors">Confirm Payment</button>
                 </form>
             </div>
        </div>
      )}

      {/* Rest of the component: New Loan Form, Recent Repayments, Active Loans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Loan Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600"/> New Loan Application
          </h3>
          <form onSubmit={createLoan} className="space-y-4">
            
            {/* Searchable Borrower Select */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Borrower</label>
              <div className="relative">
                <input 
                  type="text"
                  className={`w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${!borrowerId ? 'border-slate-200' : 'border-blue-500 bg-blue-50/30'}`}
                  placeholder="Search member name or ID..."
                  value={borrowerSearch}
                  onChange={(e) => {
                    setBorrowerSearch(e.target.value);
                    setIsDropdownOpen(true);
                    if (borrowerId) setBorrowerId(''); 
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <ChevronDown className={`absolute right-3 top-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={18} />
              </div>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map(m => (
                      <div 
                        key={m.id} 
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0"
                        onClick={() => handleSelectBorrower(m)}
                      >
                        <div>
                          <div className="font-bold text-slate-700">{m.name}</div>
                          <div className="text-xs text-slate-400">{m.id}</div>
                        </div>
                        {borrowerId === m.id && <Check size={16} className="text-blue-600" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-sm">No eligible members found.</div>
                  )}
                </div>
              )}
            </div>

            {/* Cosigner Select */}
            <div className="relative" ref={cosignerDropdownRef}>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cosigner <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text"
                  className={`w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${!cosignerId ? 'border-slate-200' : 'border-purple-500 bg-purple-50/30'}`}
                  placeholder="Search cosigner name or ID..."
                  value={cosignerSearch}
                  onChange={(e) => {
                    setCosignerSearch(e.target.value);
                    setIsCosignerDropdownOpen(true);
                    if (cosignerId) setCosignerId('');
                  }}
                  onFocus={() => setIsCosignerDropdownOpen(true)}
                  disabled={!borrowerId} 
                  required
                />
                <UserPlus className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <ChevronDown className={`absolute right-3 top-3.5 text-slate-400 transition-transform ${isCosignerDropdownOpen ? 'rotate-180' : ''}`} size={18} />
              </div>

              {/* Cosigner Dropdown List */}
              {isCosignerDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredCosigners.length > 0 ? (
                    filteredCosigners.map(m => (
                      <div 
                        key={m.id} 
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0"
                        onClick={() => handleSelectCosigner(m)}
                      >
                        <div>
                          <div className="font-bold text-slate-700">{m.name}</div>
                          <div className="text-xs text-slate-400">{m.id}</div>
                        </div>
                        {cosignerId === m.id && <Check size={16} className="text-purple-600" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-sm">No eligible cosigners found.</div>
                  )}
                </div>
              )}
              {cosignerId && (
                  <p className="text-[10px] text-amber-600 mt-1 italic flex items-center gap-1">
                      <AlertCircle size={10} /> Note: Cosigner is liable for this loan. If defaulted, contributions for both accounts will be frozen.
                  </p>
              )}
            </div>

            {borrowerId && (
              <div className={`p-3 rounded-xl text-sm ${eligibility?.eligible ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                {eligibility?.eligible 
                  ? <span className="flex items-center gap-2"><CheckCircle size={16}/> Eligible for up to ${eligibility?.limit?.toLocaleString()}</span> 
                  : <span className="flex items-center gap-2"><AlertCircle size={16}/> {eligibility?.reason}</span>}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
              <input 
                type="number" 
                className="w-full p-3 border border-slate-200 rounded-xl"
                value={loanAmount} 
                onChange={e => setLoanAmount(e.target.value)}
                placeholder="0.00"
                disabled={!eligibility?.eligible}
              />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Term</label>
              <select className="w-full p-3 border border-slate-200 rounded-xl bg-white" value={term} onChange={e => setTerm(Number(e.target.value))}>
                <option value={12}>12 Months</option>
                <option value={24}>24 Months</option>
              </select>
            </div>

            {loanAmount && !isNaN(parseFloat(loanAmount)) && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-slate-600 font-medium">Application Fee:</span>
                        <span className="font-bold text-slate-800">${calculateApplicationFee(parseFloat(loanAmount), term)}</span>
                    </div>
                    
                    <div className="flex flex-col gap-2 mb-3">
                        <label className="flex items-center gap-3 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
                            <input 
                                type="radio" 
                                name="feeType" 
                                value="upfront" 
                                checked={feeType === 'upfront'} 
                                onChange={() => setFeeType('upfront')}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-bold text-slate-700 block">Pay Upfront</span>
                                <span className="text-[10px] text-slate-500">Collect fee via cash/check now</span>
                            </div>
                            <Wallet size={16} className="text-slate-400"/>
                        </label>
                        <label className="flex items-center gap-3 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
                            <input 
                                type="radio" 
                                name="feeType" 
                                value="capitalized" 
                                checked={feeType === 'capitalized'} 
                                onChange={() => setFeeType('capitalized')}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-bold text-slate-700 block">Add to Principal</span>
                                <span className="text-[10px] text-slate-500">Roll fee into loan balance</span>
                            </div>
                            <FileText size={16} className="text-slate-400"/>
                        </label>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-600 uppercase">Monthly Payment</span>
                        <span className="text-lg font-bold text-blue-700">
                            ${((parseFloat(loanAmount) + (feeType === 'capitalized' ? calculateApplicationFee(parseFloat(loanAmount), term) : 0)) / term).toFixed(2)}
                        </span>
                    </div>
                </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!eligibility?.eligible || !cosignerId}
            >
              Issue Loan
            </button>
          </form>
        </div>
        
        {/* Recent Repayments List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
           <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <History size={20} className="text-emerald-600"/> Recent Repayments
           </h4>
           <div className="flex-1 overflow-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                 <tr>
                   <th className="px-3 py-2">Date</th>
                   <th className="px-3 py-2">Borrower</th>
                   <th className="px-3 py-2 text-right">Amount</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {recentRepayments.map(t => {
                   const borrower = members.find(m => m.id === t.memberId);
                   return (
                     <tr key={t.id} className="hover:bg-slate-50">
                       <td className="px-3 py-2 text-slate-500">
                           {new Date(t.date).toLocaleDateString()}
                           <div className="text-[10px] text-slate-400">Via {t.paymentMethod}</div>
                       </td>
                       <td className="px-3 py-2 font-medium text-slate-800">{borrower?.name || t.memberId}</td>
                       <td className="px-3 py-2 text-right font-bold text-emerald-600">${t.amount.toLocaleString()}</td>
                     </tr>
                   );
                 })}
                 {recentRepayments.length === 0 && (
                   <tr><td colSpan={3} className="px-3 py-8 text-center text-slate-400 italic">No repayments recorded yet.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
           <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-end">
             <div className="text-xs text-slate-400">Total Active Loans</div>
             <div className="text-xl font-bold text-slate-800">${loans.filter(l => l.status === 'ACTIVE').reduce((acc, curr) => acc + curr.remainingBalance, 0).toLocaleString()}</div>
           </div>
        </div>
      </div>

      {/* Active Loans List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Active Loans</h3>
        <div className="space-y-4">
          {loans.filter(l => l.status === 'ACTIVE').map(loan => {
            const borrower = members.find(m => m.id === loan.borrowerId);
            return (
              <div key={loan.id} className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-200 transition-colors">
                 <div className="flex-1">
                   <h4 className="font-bold text-slate-800">{borrower?.name} <span className="text-slate-400 font-normal text-sm">({loan.borrowerId})</span></h4>
                   <div className="text-sm text-slate-500 mt-2 flex flex-wrap gap-2 items-center">
                     <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">Started: {new Date(loan.startDate).toLocaleDateString()}</span>
                     <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">Term: {loan.termMonths}mo</span>
                     <span className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                       <Clock size={12}/> Next Due: {new Date(loan.nextPaymentDue).toLocaleDateString()}
                     </span>
                     {loan.cosignerId && (
                         <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 flex items-center gap-1">
                             <UserPlus size={12} /> Cosigner: {members.find(m => m.id === loan.cosignerId)?.name}
                         </span>
                     )}
                   </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold">Balance</p>
                    <p className="text-xl font-bold text-blue-600">${loan.remainingBalance.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">of ${loan.originalAmount.toLocaleString()}</p>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setScheduleLoan(loan)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                    >
                      <Calendar size={14} /> Schedule
                    </button>
                    <button 
                      onClick={() => {
                        setRepaymentLoan(loan);
                        setRepayAmount('');
                      }}
                      className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors"
                    >
                      Record Payment
                    </button>
                 </div>
              </div>
            );
          })}
          {loans.filter(l => l.status === 'ACTIVE').length === 0 && (
             <p className="text-slate-400 italic text-center py-8">No active loans.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoansComponent;