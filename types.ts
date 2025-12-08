export interface BeneficiaryInfo {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface MemberProfile {
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  beneficiary: BeneficiaryInfo;
  autoPayEnabled: boolean;
  preferredPaymentMethod: 'zelle' | 'ach' | 'none';
}

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
  autoPay?: boolean;
  // Extended profile fields
  profile?: MemberProfile;
}

export interface PendingPayment {
  id: string;
  memberId: string;
  amount: number;
  method: 'zelle' | 'ach';
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
  confirmedAt?: string;
  referenceNumber?: string;
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
  status?: 'completed' | 'pending' | 'failed';
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