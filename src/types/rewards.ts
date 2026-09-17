export type CurrencyType = 'VEs' | 'SVEs' | 'Gems' | 'Tokens' | 'Spins';

export interface CurrencyConfig {
  type: CurrencyType;
  name: string;
  symbol: string;
  description: string;
  color: string;
  gradient: string;
  borderColor: string;
  iconName: 'Zap' | 'ShieldCheck' | 'Gem' | 'Coins' | 'RotateCw';
  glowClass: string;
}

export interface UserWallet {
  userId: string;
  userName: string;
  email: string;
  avatarUrl: string;
  tier: string;
  balances: Record<CurrencyType, number>;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  currency: CurrencyType;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  category: 'Reward' | 'Withdrawal' | 'Bonus' | 'Spin' | 'Referral';
  referenceId?: string;
}

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PayoutMethodId = 'upi' | 'amazon_gift' | 'google_play';

export interface PayoutMethod {
  id: PayoutMethodId;
  title: string;
  subtitle: string;
  iconName: 'Smartphone' | 'ShoppingBag' | 'Play';
  status: 'active' | 'inactive';
  statusReason?: string;
  requiredFieldLabel: string;
  placeholder: string;
  fieldType: 'text' | 'email';
  instructions: string;
}

export interface PayoutDenomination {
  id: string;
  methodId: PayoutMethodId;
  payoutAmount: number; // In INR ₹
  requiredVEs: number;
  currencySymbol: string;
  popular?: boolean;
}

export interface PayoutRequestPayload {
  methodId: PayoutMethodId;
  denominationId: string;
  payoutAmount: number;
  requiredVEs: number;
  recipientDetail: string;
  recipientName?: string;
}

export interface PayoutResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  payoutAmount: number;
  requiredVEs: number;
  newVeBalance: number;
  message: string;
  timestamp: string;
}

// ─── Withdrawal / History Types ───

export type WithdrawalStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled';

export interface Withdrawal {
  id: string;
  method: PayoutMethodId;
  methodLabel: string;
  payoutAmount: number;
  requiredVEs: number;
  currencySymbol: string;
  recipientDetail: string;
  status: WithdrawalStatus;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
  transactionId?: string;
}

export interface PaginatedWithdrawals {
  items: Withdrawal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth ───

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface SignupPayload {
  title: 'Mr' | 'Mrs' | 'Miss' | 'Master';
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone: string;
  password?: string;
  gender?: 'Male' | 'Female' | 'Other';
  date_of_birth?: string;
  country_code?: string;
  role?: 'user' | 'admin' | 'staff';
}

// ─── Dev Tools ───

export interface DevSettings {
  simulatedDelayMs: number;
  forceWalletFetchError: boolean;
  forcePayoutErrorType: 'none' | 'insufficient_balance' | 'inactive_method' | 'duplicate_request' | 'server_error';
  emptyTransactions: boolean;
  userPreset: 'high' | 'low';
}
