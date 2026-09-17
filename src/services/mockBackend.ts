import type {
  CurrencyConfig,
  UserWallet,
  Transaction,
  PayoutMethod,
  PayoutDenomination,
  PayoutRequestPayload,
  PayoutResponse,
  PaginatedTransactions,
  DevSettings,
  Withdrawal,
  PaginatedWithdrawals,
  WithdrawalStatus,
} from '../types/rewards';

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  VEs: {
    type: 'VEs',
    name: 'Velocity Earnings',
    symbol: 'VE',
    description: 'Primary reward currency redeemable for real cash payouts & gift vouchers.',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.06) 100%)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    iconName: 'Zap',
    glowClass: 'currency-card-green',
  },
  SVEs: {
    type: 'SVEs',
    name: 'Super VEs',
    symbol: 'SVE',
    description: 'High-tier multiplier credits earned from streak challenges.',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(109, 40, 217, 0.06) 100%)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
    iconName: 'ShieldCheck',
    glowClass: 'currency-card-purple',
  },
  Gems: {
    type: 'Gems',
    name: 'Bonus Gems',
    symbol: 'GEM',
    description: 'Premium vault gems used for instant reward boosts and spin passes.',
    color: '#F43F5E',
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(225, 29, 72, 0.06) 100%)',
    borderColor: 'rgba(244, 63, 94, 0.35)',
    iconName: 'Gem',
    glowClass: 'currency-card-rose',
  },
  Tokens: {
    type: 'Tokens',
    name: 'Activity Tokens',
    symbol: 'TKN',
    description: 'Earned by watching ads, engaging in surveys, and daily check-ins.',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.06) 100%)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    iconName: 'Coins',
    glowClass: 'currency-card-amber',
  },
  Spins: {
    type: 'Spins',
    name: 'Wheel Spins',
    symbol: 'SPN',
    description: 'Free daily turns on the VELoop Lucky Wheel for jackpot VEs.',
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(2, 132, 199, 0.06) 100%)',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    iconName: 'RotateCw',
    glowClass: 'currency-card-cyan',
  },
};

const DEFAULT_DEV_SETTINGS: DevSettings = {
  simulatedDelayMs: 600,
  forceWalletFetchError: false,
  forcePayoutErrorType: 'none',
  emptyTransactions: false,
  userPreset: 'high',
};

const HIGH_BALANCE_USER: UserWallet = {
  userId: 'usr_883921',
  userName: 'Alex Dev',
  email: 'alex.dev@veloop.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  tier: 'VIP Gold Member',
  balances: {
    VEs: 25000,
    SVEs: 5000,
    Gems: 100,
    Tokens: 1850,
    Spins: 14,
  },
};

const LOW_BALANCE_USER: UserWallet = {
  userId: 'usr_102948',
  userName: 'Jordan Demo',
  email: 'jordan@veloop.io',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  tier: 'Starter Member',
  balances: {
    VEs: 180,
    SVEs: 20,
    Gems: 5,
    Tokens: 210,
    Spins: 2,
  },
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_9012',
    type: 'credit',
    currency: 'VEs',
    amount: 500,
    description: 'Ad Streak Booster Reward',
    status: 'completed',
    date: '2026-09-08T10:30:00Z',
    category: 'Reward',
    referenceId: 'REF-88419',
  },
  {
    id: 'tx_9011',
    type: 'debit',
    currency: 'VEs',
    amount: 19500,
    description: 'UPI Payout (₹100 to alex@okicici)',
    status: 'completed',
    date: '2026-09-07T16:15:00Z',
    category: 'Withdrawal',
    referenceId: 'UPI-99214',
  },
  {
    id: 'tx_9010',
    type: 'credit',
    currency: 'VEs',
    amount: 250,
    description: 'Daily Check-in Bonus',
    status: 'completed',
    date: '2026-09-07T08:00:00Z',
    category: 'Bonus',
    referenceId: 'BONUS-001',
  },
  {
    id: 'tx_9009',
    type: 'credit',
    currency: 'SVEs',
    amount: 50,
    description: 'Level 5 Tier Milestone Upgrade',
    status: 'completed',
    date: '2026-09-06T19:40:00Z',
    category: 'Reward',
    referenceId: 'LEVEL-005',
  },
  {
    id: 'tx_9008',
    type: 'debit',
    currency: 'VEs',
    amount: 10000,
    description: 'Amazon Gift Card ₹50 Voucher',
    status: 'pending',
    date: '2026-09-06T14:20:00Z',
    category: 'Withdrawal',
    referenceId: 'AMZ-33291',
  },
  {
    id: 'tx_9007',
    type: 'credit',
    currency: 'Tokens',
    amount: 350,
    description: 'Survey Completion: Tech Feedback',
    status: 'completed',
    date: '2026-09-05T11:10:00Z',
    category: 'Reward',
    referenceId: 'SRV-1029',
  },
  {
    id: 'tx_9006',
    type: 'credit',
    currency: 'Spins',
    amount: 5,
    description: 'Weekly Loyalty Bonus Spin Pack',
    status: 'completed',
    date: '2026-09-04T09:00:00Z',
    category: 'Spin',
    referenceId: 'SPN-4421',
  },
  {
    id: 'tx_9005',
    type: 'credit',
    currency: 'Gems',
    amount: 15,
    description: 'Referral Bonus: Friend Joined',
    status: 'completed',
    date: '2026-09-03T18:25:00Z',
    category: 'Referral',
    referenceId: 'REF-7712',
  },
  {
    id: 'tx_9004',
    type: 'credit',
    currency: 'VEs',
    amount: 1000,
    description: 'Game Reward: Speed Run Challenge',
    status: 'completed',
    date: '2026-09-03T10:00:00Z',
    category: 'Reward',
    referenceId: 'GAME-221',
  },
  {
    id: 'tx_9003',
    type: 'credit',
    currency: 'VEs',
    amount: 2400,
    description: 'Referral Payout: 3 Active Referrals',
    status: 'completed',
    date: '2026-09-02T15:00:00Z',
    category: 'Referral',
    referenceId: 'REF-BATCH-03',
  },
];

export const PAYOUT_METHODS: PayoutMethod[] = [
  {
    id: 'upi',
    title: 'UPI Direct Transfer',
    subtitle: 'Instant transfer directly to Google Pay, PhonePe, Paytm, or BHIM UPI ID.',
    iconName: 'Smartphone',
    status: 'active',
    requiredFieldLabel: 'Virtual Payment Address (VPA / UPI ID)',
    placeholder: 'e.g. yourname@okhdfcbank or 9876543210@paytm',
    fieldType: 'text',
    instructions: 'Verification takes 5-10 seconds. Money is deposited directly into your linked bank account.',
  },
  {
    id: 'amazon_gift',
    title: 'Amazon Gift Card',
    subtitle: 'Digital voucher code delivered instantly to your registered email.',
    iconName: 'ShoppingBag',
    status: 'active',
    requiredFieldLabel: 'Recipient Email Address',
    placeholder: 'e.g. your.email@example.com',
    fieldType: 'email',
    instructions: 'Voucher claims code will be sent via email with full instructions for Amazon Pay balance top-up.',
  },
  {
    id: 'google_play',
    title: 'Google Play Recharge',
    subtitle: 'Redeem code for Play Store apps, games, movies, and in-app purchases.',
    iconName: 'Play',
    status: 'inactive',
    statusReason: 'Temporarily out of stock for maintenance by provider. Back online soon.',
    requiredFieldLabel: 'Google Account Email',
    placeholder: 'e.g. user@gmail.com',
    fieldType: 'email',
    instructions: 'Code can be redeemed directly in Google Play Store under Payment Methods.',
  },
];

export const PAYOUT_DENOMINATIONS: PayoutDenomination[] = [
  { id: 'den_500',  methodId: 'upi', payoutAmount: 500,  requiredVEs: 50,    currencySymbol: '₹', popular: false },
  { id: 'den_1000', methodId: 'upi', payoutAmount: 1000, requiredVEs: 100,   currencySymbol: '₹', popular: true  },

  { id: 'amz_500',  methodId: 'amazon_gift', payoutAmount: 500,  requiredVEs: 50,   currencySymbol: '₹', popular: false },
  { id: 'amz_1000', methodId: 'amazon_gift', payoutAmount: 1000, requiredVEs: 100, currencySymbol: '₹', popular: true  },

  { id: 'play_1000', methodId: 'google_play', payoutAmount: 1000, requiredVEs: 100, currencySymbol: '₹', popular: true },
];

const INITIAL_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'wth_001',
    method: 'upi',
    methodLabel: 'UPI Direct Transfer',
    payoutAmount: 100,
    requiredVEs: 19500,
    currencySymbol: '₹',
    recipientDetail: 'alex@okicici',
    status: 'approved',
    requestedAt: '2026-09-07T16:15:00Z',
    processedAt: '2026-09-08T10:00:00Z',
    transactionId: 'tx_9011',
  },
  {
    id: 'wth_002',
    method: 'amazon_gift',
    methodLabel: 'Amazon Gift Card',
    payoutAmount: 50,
    requiredVEs: 10000,
    currencySymbol: '₹',
    recipientDetail: 'alex.dev@gmail.com',
    status: 'pending',
    requestedAt: '2026-09-06T14:20:00Z',
    transactionId: 'tx_9008',
  },
  {
    id: 'wth_003',
    method: 'upi',
    methodLabel: 'UPI Direct Transfer',
    payoutAmount: 25,
    requiredVEs: 5800,
    currencySymbol: '₹',
    recipientDetail: 'alex@paytm',
    status: 'rejected',
    rejectionReason: 'UPI ID not found or invalid. Please verify your VPA and try again.',
    requestedAt: '2026-09-04T11:30:00Z',
    processedAt: '2026-09-04T18:00:00Z',
  },
];

// ─── Storage Keys ───
const STORAGE_KEYS = {
  SETTINGS: 'veloop_dev_settings',
  WALLET: 'veloop_user_wallet',
  TRANSACTIONS: 'veloop_transactions',
  WITHDRAWALS: 'veloop_withdrawals',
};

// ─── Mock Backend Store ───
class MockBackendStore {
  private settings: DevSettings;
  private wallet: UserWallet;
  private transactions: Transaction[];
  private withdrawals: Withdrawal[];

  constructor() {
    this.settings = this.loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_DEV_SETTINGS);
    this.wallet = this.loadFromStorage(
      STORAGE_KEYS.WALLET,
      this.settings.userPreset === 'low' ? LOW_BALANCE_USER : HIGH_BALANCE_USER
    );
    this.transactions = this.loadFromStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    this.withdrawals  = this.loadFromStorage(STORAGE_KEYS.WITHDRAWALS, INITIAL_WITHDRAWALS);
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveToStorage(key: string, data: any) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.warn('LocalStorage save error:', e); }
  }

  public getSettings(): DevSettings { return { ...this.settings }; }

  public updateSettings(newSettings: Partial<DevSettings>): DevSettings {
    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.userPreset) {
      this.wallet = newSettings.userPreset === 'low' ? { ...LOW_BALANCE_USER } : { ...HIGH_BALANCE_USER };
      this.saveToStorage(STORAGE_KEYS.WALLET, this.wallet);
    }
    this.saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
    return this.settings;
  }

  public async delay(): Promise<void> {
    if (this.settings.simulatedDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.settings.simulatedDelayMs));
    }
  }

  public async creditWallet(amount = 1000): Promise<{ success: boolean; newBalance: number }> {
    await this.delay();
    this.wallet.balances.VEs += amount;
    this.transactions.unshift({
      id: `tx_${Date.now()}`,
      type: 'credit',
      currency: 'VEs',
      amount,
      date: new Date().toISOString(),
      status: 'completed',
      description: `Bonus VEs Credit (+${amount.toLocaleString()} VEs)`,
      category: 'Bonus',
    });
    this.saveToStorage(STORAGE_KEYS.WALLET, this.wallet);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    return { success: true, newBalance: this.wallet.balances.VEs };
  }

  public async getWallet(): Promise<UserWallet> {
    await this.delay();
    if (this.settings.forceWalletFetchError) {
      throw new Error("Couldn't load your wallet data. Backend server returned HTTP 500 (Internal Server Error).");
    }
    return JSON.parse(JSON.stringify(this.wallet));
  }

  public async getTransactions(page = 1, limit = 5): Promise<PaginatedTransactions> {
    await this.delay();
    if (this.settings.forceWalletFetchError) throw new Error("Couldn't fetch transaction history.");
    if (this.settings.emptyTransactions) return { items: [], total: 0, page: 1, limit, totalPages: 0 };

    const items = [...this.transactions];
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const validPage = Math.max(1, Math.min(page, totalPages));
    const paginatedItems = items.slice((validPage - 1) * limit, validPage * limit);
    return { items: JSON.parse(JSON.stringify(paginatedItems)), total, page: validPage, limit, totalPages };
  }

  public async getPayoutMethods(): Promise<PayoutMethod[]> {
    await this.delay();
    return JSON.parse(JSON.stringify(PAYOUT_METHODS));
  }

  public async getDenominations(methodId?: string): Promise<PayoutDenomination[]> {
    await this.delay();
    const denoms = methodId ? PAYOUT_DENOMINATIONS.filter((d) => d.methodId === methodId) : PAYOUT_DENOMINATIONS;
    return JSON.parse(JSON.stringify(denoms));
  }

  public async getWithdrawals(status?: WithdrawalStatus | 'all', page = 1, limit = 10): Promise<PaginatedWithdrawals> {
    await this.delay();
    let items = [...this.withdrawals];
    if (status && status !== 'all') items = items.filter((w) => w.status === status);
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const validPage = Math.max(1, Math.min(page, totalPages));
    const paginatedItems = items.slice((validPage - 1) * limit, validPage * limit);
    return { items: JSON.parse(JSON.stringify(paginatedItems)), total, page: validPage, limit, totalPages };
  }

  public async cancelWithdrawal(id: string): Promise<{ success: boolean; message: string }> {
    await this.delay();
    const idx = this.withdrawals.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error('Withdrawal not found.');
    const withdrawal = this.withdrawals[idx];
    if (withdrawal.status !== 'pending') throw new Error('Only pending withdrawals can be cancelled.');

    // Restore VEs
    this.wallet.balances.VEs += withdrawal.requiredVEs;
    this.saveToStorage(STORAGE_KEYS.WALLET, this.wallet);

    // Update withdrawal status
    this.withdrawals[idx] = { ...withdrawal, status: 'cancelled', processedAt: new Date().toISOString() };
    this.saveToStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);

    // Mark corresponding transaction as failed
    const txIdx = this.transactions.findIndex((t) => t.referenceId === withdrawal.transactionId);
    if (txIdx !== -1) {
      this.transactions[txIdx] = { ...this.transactions[txIdx], status: 'failed' };
      this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    }

    return { success: true, message: `Withdrawal #${id} cancelled. ${withdrawal.requiredVEs.toLocaleString()} VEs have been restored.` };
  }

  public async requestPayout(payload: PayoutRequestPayload): Promise<PayoutResponse> {
    await this.delay();

    if (this.settings.forcePayoutErrorType === 'insufficient_balance') throw new Error('Insufficient VEs balance for this payout denomination.');
    if (this.settings.forcePayoutErrorType === 'inactive_method') throw new Error('This redemption method is currently inactive or under maintenance.');
    if (this.settings.forcePayoutErrorType === 'duplicate_request') throw new Error('You already have a pending withdrawal request for this amount.');
    if (this.settings.forcePayoutErrorType === 'server_error') throw new Error('Payout gateway timeout (504 Gateway Error). Please retry shortly.');

    const method = PAYOUT_METHODS.find((m) => m.id === payload.methodId);
    if (!method || method.status !== 'active') throw new Error(`Method "${payload.methodId}" is inactive or invalid.`);

    if (this.wallet.balances.VEs < payload.requiredVEs) {
      throw new Error(`Insufficient VEs! You have ${this.wallet.balances.VEs} VEs, but this payout requires ${payload.requiredVEs} VEs.`);
    }

    this.wallet.balances.VEs -= payload.requiredVEs;
    this.saveToStorage(STORAGE_KEYS.WALLET, this.wallet);

    const refId = `WD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTx: Transaction = {
      id: `tx_${Date.now().toString().slice(-5)}`,
      type: 'debit',
      currency: 'VEs',
      amount: payload.requiredVEs,
      description: `${method.title} (₹${payload.payoutAmount} to ${payload.recipientDetail})`,
      status: 'pending',
      date: new Date().toISOString(),
      category: 'Withdrawal',
      referenceId: refId,
    };

    const newWithdrawal: Withdrawal = {
      id: `wth_${Date.now().toString().slice(-5)}`,
      method: payload.methodId,
      methodLabel: method.title,
      payoutAmount: payload.payoutAmount,
      requiredVEs: payload.requiredVEs,
      currencySymbol: '₹',
      recipientDetail: payload.recipientDetail,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      transactionId: newTx.id,
    };

    this.transactions.unshift(newTx);
    this.withdrawals.unshift(newWithdrawal);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    this.saveToStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);

    return {
      success: true,
      transactionId: newWithdrawal.id,
      status: 'pending',
      payoutAmount: payload.payoutAmount,
      requiredVEs: payload.requiredVEs,
      newVeBalance: this.wallet.balances.VEs,
      message: `Withdrawal submitted! ₹${payload.payoutAmount} request is now Pending review.`,
      timestamp: new Date().toISOString(),
    };
  }

  public resetData() {
    this.wallet = { ...HIGH_BALANCE_USER };
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.withdrawals = [...INITIAL_WITHDRAWALS];
    this.settings = { ...DEFAULT_DEV_SETTINGS };
    this.saveToStorage(STORAGE_KEYS.WALLET, this.wallet);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    this.saveToStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);
    this.saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
  }
}

export const mockBackend = new MockBackendStore();
