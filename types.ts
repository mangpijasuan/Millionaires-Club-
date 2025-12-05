export interface Member {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  accountStatus: 'Active' | 'Inactive';
  phone: string;
  address: string;
  beneficiary: string;
  totalContribution: number;
  activeLoanId: string | null;
  lastLoanPaidDate: string | null;
}

export interface Loan {
  id: string;
  borrowerId: string;
  cosignerId?: string;
  originalAmount: number;
  remainingBalance: number;
  termMonths: number;
  status: 'ACTIVE' | 'PAID' | 'DEFAULTED';
  startDate: string;
  nextPaymentDue: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  type: 'CONTRIBUTION' | 'LOAN_DISBURSAL' | 'LOAN_REPAYMENT' | 'FEE';
  amount: number;
  date: string;
  description: string;
  paymentMethod?: string;
  receivedBy?: string;
}

export interface CommunicationLog {
  id: string;
  memberId: string;
  type: 'System' | 'Note' | 'Email' | 'SMS';
  content: string;
  date: string;
  direction: 'Inbound' | 'Outbound';
  adminId?: string;
}

export interface YearlyContribution {
  [year: number]: number;
}