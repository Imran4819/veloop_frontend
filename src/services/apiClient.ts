import type {
  UserWallet,
  PaginatedTransactions,
  PayoutMethod,
  PayoutDenomination,
  PayoutRequestPayload,
  PayoutResponse,
  LoginPayload,
  SignupPayload,
  PaginatedWithdrawals,
  WithdrawalStatus,
} from '../types/rewards';
import { mockBackend } from './mockBackend';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://veloop-backend-dzh4.onrender.com/api/v1';

// ─── Helpers ───

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('veloop_access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const isNetworkError = (err: any): boolean =>
  !err.message ||
  err.message.includes('Failed to fetch') ||
  err.message.includes('NetworkError') ||
  err.message.includes('net::ERR') ||
  err.message.includes('ECONNREFUSED');

// ─── API Connection Status ───
let _lastApiStatus: 'live' | 'mock' | 'unknown' = 'unknown';
export const getApiStatus = () => _lastApiStatus;

// ─── Auth Helper ───
export const isUserLoggedIn = (): boolean => Boolean(localStorage.getItem('veloop_access_token'));

// ─── API Client ───
export const apiClient = {

  // ── Auth ──────────────────────────────────────────────────────

  async login(payload: LoginPayload): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({ message: 'Failed to parse response' }));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || `HTTP ${res.status}: Login failed`);
      }
      const token = data.access_token || data.token || data.data?.access_token;
      if (token) {
        localStorage.setItem('veloop_access_token', token);
        // Fetch and cache user profile right after login
        try {
          const profile = await this.getUserProfile();
          if (profile) localStorage.setItem('veloop_user_profile', JSON.stringify(profile));
        } catch { /* non-critical */ }
      }
      _lastApiStatus = 'live';
      return data;
    } catch (err: any) {
      if (!isNetworkError(err)) throw err;
      _lastApiStatus = 'mock';
      localStorage.setItem('veloop_access_token', 'mock_demo_token');
      return { success: true, message: 'Logged in via demo mode' };
    }
  },

  async signup(payload: SignupPayload): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({ message: 'Failed to parse response' }));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || `HTTP ${res.status}: Signup failed`);
      }
      _lastApiStatus = 'live';
      return data;
    } catch (err: any) {
      if (!isNetworkError(err)) throw err;
      _lastApiStatus = 'mock';
      return { success: true, message: 'Signup demo successful — backend offline' };
    }
  },

  // Fetch logged-in user profile from GET /auth/me and cache it
  async getUserProfile(): Promise<any | null> {
    if (!isUserLoggedIn()) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const u = data.data;
          const profile = {
            userId:    u._id       || u.user_id  || u.id || '',
            userName:  `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.name || u.email || 'User',
            email:     u.email    || '',
            avatarUrl: u.avatar_url || u.profile_picture || '',
            tier:      u.role === 'admin' ? 'Admin' : u.role === 'staff' ? 'Staff' : (u.tier || 'Member'),
          };
          localStorage.setItem('veloop_user_profile', JSON.stringify(profile));
          return profile;
        }
      }
    } catch { /* non-critical */ }
    return null;
  },

  // Read cached user profile (set by getUserProfile or login)
  getCachedProfile(): { userId: string; userName: string; email: string; avatarUrl: string; tier: string } | null {
    try {
      const raw = localStorage.getItem('veloop_user_profile');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  // ── Wallet ────────────────────────────────────────────────────

  async getWallet(): Promise<UserWallet> {
    if (!isUserLoggedIn()) {
      throw new Error('User is not logged in. Please log in first.');
    }
    // Try to refresh profile from backend first (non-blocking)
    if (localStorage.getItem('veloop_access_token') && localStorage.getItem('veloop_access_token') !== 'mock_demo_token') {
      this.getUserProfile().catch(() => {});
    }

    const cached = this.getCachedProfile();

    try {
      const res = await fetch(`${API_BASE_URL}/wallet`, { headers: getAuthHeaders() });
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.success && responseData.data) {
          const d = responseData.data;
          _lastApiStatus = 'live';
          return {
            userId:    cached?.userId    || d.user_id || d.userId || 'usr_live',
            userName:  cached?.userName  || d.user_name || d.name || 'User',
            email:     cached?.email     || d.email || '',
            avatarUrl: cached?.avatarUrl || d.avatar_url || '',
            tier:      cached?.tier      || d.tier || 'Member',
            balances: {
              VEs:    Number(d.VEs    ?? d.ves    ?? d.balances?.VEs    ?? 0),
              SVEs:   Number(d.SVEs   ?? d.sves   ?? d.balances?.SVEs   ?? 0),
              Gems:   Number(d.Gems   ?? d.gems   ?? d.balances?.Gems   ?? 0),
              Tokens: Number(d.Tokens ?? d.tokens ?? d.balances?.Tokens ?? 0),
              Spins:  Number(d.Spins  ?? d.spins  ?? d.balances?.Spins  ?? 0),
            },
          };
        }
      }
    } catch {
      // Offline — fall through
    }
    _lastApiStatus = 'mock';
    const mockWallet = await mockBackend.getWallet();
    // Overlay cached real profile on top of mock wallet if available
    if (cached && cached.userName && cached.userName !== 'User') {
      return { ...mockWallet, userId: cached.userId, userName: cached.userName, email: cached.email, avatarUrl: cached.avatarUrl || mockWallet.avatarUrl, tier: cached.tier };
    }
    return mockWallet;
  },

  async creditWallet(amount = 1000): Promise<any> {
    if (!isUserLoggedIn()) {
      throw new Error('User is not logged in. Please log in first.');
    }
    try {
      const res = await fetch(`${API_BASE_URL}/wallet/credit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount,
          currency: 'VEs',
          category: 'bonus',
          description: `Bonus VEs Credit (+${amount.toLocaleString()} VEs)`,
        }),
      });
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.success) {
          _lastApiStatus = 'live';
          return responseData;
        }
      }
    } catch {
      /* offline fallback */
    }
    _lastApiStatus = 'mock';
    return mockBackend.creditWallet(amount);
  },

  async getTransactions(page = 1, limit = 5): Promise<PaginatedTransactions> {
    if (!isUserLoggedIn()) {
      throw new Error('User is not logged in. Please log in first.');
    }
    try {
      const res = await fetch(`${API_BASE_URL}/wallet/transactions?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.success && responseData.data) {
          const rawItems  = responseData.data.transactions || [];
          const pagination = responseData.data.pagination || {};
          _lastApiStatus = 'live';
          const items = rawItems.map((txn: any) => ({
            id: txn.transaction_id || txn._id,
            type: txn.type === 'CREDIT' ? 'credit' : 'debit',
            currency: txn.currency || 'VEs',
            amount: txn.amount || 0,
            date: txn.timestamp || txn.createdAt || new Date().toISOString(),
            status: (txn.status || 'completed').toLowerCase(),
            description: txn.description || `${txn.category} transaction`,
            category: txn.category === 'withdrawal' || txn.source === 'WITHDRAWAL' ? 'Withdrawal' : 'Reward',
            referenceId: txn.referenceId || txn.reference_id,
          }));
          return {
            items,
            page: pagination.page || page,
            limit: pagination.limit || limit,
            total: pagination.total || items.length,
            totalPages: pagination.totalPages || 1,
          };
        }
      }
    } catch {
      // Offline
    }
    _lastApiStatus = 'mock';
    return mockBackend.getTransactions(page, limit);
  },

  // ── Payout Methods ────────────────────────────────────────────

  async getPayoutMethods(): Promise<PayoutMethod[]> {
    if (!isUserLoggedIn()) {
      throw new Error('User is not logged in. Please log in first.');
    }
    try {
      const res = await fetch(`${API_BASE_URL}/payout/methods`, { headers: getAuthHeaders() });
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.success && Array.isArray(responseData.data)) {
          _lastApiStatus = 'live';
          return responseData.data.map((m: any) => {
            // Normalize backend method IDs to frontend IDs
            const rawId: string = (m.id || m.method_id || '').toLowerCase();
            let id: 'upi' | 'amazon_gift' | 'google_play' = 'upi';
            if (rawId.includes('amazon') || rawId.includes('gift_card')) id = 'amazon_gift';
            else if (rawId.includes('google') || rawId.includes('play')) id = 'google_play';
            else if (rawId.includes('upi') || rawId.includes('bank')) id = 'upi';

            const iconMap: Record<string, 'Smartphone' | 'ShoppingBag' | 'Play'> = {
              upi: 'Smartphone',
              amazon_gift: 'ShoppingBag',
              google_play: 'Play',
            };

            const isExplicitlyInactive = m.is_active === false || m.active === false || m.status === 'inactive' || m.status === 'disabled';

            return {
              id,
              title: m.title || m.name,
              subtitle: m.description || m.subtitle || '',
              iconName: iconMap[id],
              status: isExplicitlyInactive ? 'inactive' : 'active',
              statusReason: m.inactive_reason || m.statusReason,
              requiredFieldLabel: id === 'upi' ? 'Virtual Payment Address (VPA / UPI ID)' : 'Recipient Email Address',
              fieldType: id === 'upi' ? 'text' : 'email',
              placeholder: id === 'upi' ? 'e.g. name@okhdfcbank' : 'e.g. user@example.com',
              instructions: m.instructions || 'Enter valid details for instant processing.',
            };
          });
        }
      }
    } catch {
      // Offline
    }
    _lastApiStatus = 'mock';
    return mockBackend.getPayoutMethods();
  },

  async getDenominations(methodId?: string): Promise<PayoutDenomination[]> {
    if (!isUserLoggedIn()) {
      throw new Error('User is not logged in. Please log in first.');
    }
    try {
      const params = new URLSearchParams();
      if (methodId) params.set('type', methodId);
      const url = `${API_BASE_URL}/payout/options${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.success && Array.isArray(responseData.data)) {
          _lastApiStatus = 'live';
          return responseData.data.map((opt: any) => {
            const rawType: string = (opt.type || opt.method_id || '').toLowerCase();
            let mid: 'upi' | 'amazon_gift' | 'google_play' = 'upi';
            if (rawType.includes('amazon') || rawType.includes('gift_card')) mid = 'amazon_gift';
            else if (rawType.includes('google') || rawType.includes('play')) mid = 'google_play';
            const rewardVal = opt.reward_value ?? opt.payout_value ?? opt.payoutAmount ?? 0;
            return {
              id: opt._id || opt.option_id || opt.id,
              methodId: mid,
              payoutAmount: rewardVal,
              requiredVEs: opt.required_amount ?? opt.requiredVEs ?? 0,
              currencySymbol: opt.reward_currency_symbol || '₹',
              popular: rewardVal === 1000 || rewardVal === 500,
            };
          });
        }
      }
    } catch {
      // Offline
    }
    _lastApiStatus = 'mock';
    return mockBackend.getDenominations(methodId);
  },

  // ── Withdrawals ───────────────────────────────────────────────

  async submitPayout(payload: PayoutRequestPayload): Promise<PayoutResponse> {
    if (!isUserLoggedIn()) {
      throw new Error('User is not logged in. Please log in first.');
    }
    try {
      const body = {
        payoutOptionId: payload.denominationId,
        payoutDetails: {
          recipientDetail: payload.recipientDetail,
          upi_id: payload.recipientDetail,
          email: payload.recipientDetail,
          recipientName: payload.recipientName || '',
        },
        idempotencyKey: `WTH-REQ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };

      const res = await fetch(`${API_BASE_URL}/withdrawals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const responseData = await res.json();
      if (!res.ok || responseData.success === false) {
        throw new Error(responseData.message || responseData.error || 'Withdrawal request failed');
      }
      _lastApiStatus = 'live';
      const wthData = responseData.data || {};
      const currentWallet = await this.getWallet();

      return {
        success: true,
        transactionId: wthData.withdrawal_id || wthData._id || `WTH-${Date.now()}`,
        status: wthData.status || 'pending',
        payoutAmount: wthData.reward_value ?? payload.payoutAmount,
        requiredVEs: wthData.amount ?? payload.requiredVEs,
        newVeBalance: currentWallet.balances.VEs,
        message: responseData.message || 'Withdrawal submitted successfully.',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      if (!isNetworkError(err)) throw err;
      _lastApiStatus = 'mock';
      return mockBackend.requestPayout(payload);
    }
  },

  async getWithdrawals(
    status?: WithdrawalStatus | 'all',
    page = 1,
    limit = 10
  ): Promise<PaginatedWithdrawals> {
    if (!isUserLoggedIn()) {
      throw new Error('User is not logged in. Please log in first.');
    }
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status && status !== 'all') params.set('status', status.toUpperCase());
      const res = await fetch(`${API_BASE_URL}/withdrawals?${params}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.success && responseData.data) {
          _lastApiStatus = 'live';
          const rawItems = responseData.data.withdrawals || [];
          const pagination = responseData.data.pagination || {};
          const methodLabels: Record<string, string> = {
            upi: 'UPI Direct Transfer',
            amazon_gift: 'Amazon Gift Card',
            google_play: 'Google Play Recharge',
          };
          const items = rawItems.map((w: any) => {
            const rawMethod = (w.method || '').toLowerCase();
            let mid: 'upi' | 'amazon_gift' | 'google_play' = 'upi';
            if (rawMethod.includes('amazon')) mid = 'amazon_gift';
            else if (rawMethod.includes('google') || rawMethod.includes('play')) mid = 'google_play';
            return {
              id: w._id || w.withdrawal_id,
              method: mid,
              methodLabel: methodLabels[mid],
              payoutAmount: w.reward_value ?? w.payoutAmount ?? 0,
              requiredVEs: w.amount ?? w.requiredVEs ?? 0,
              currencySymbol: '₹',
              recipientDetail: w.payout_details?.recipientDetail || w.recipientDetail || '',
              status: (w.status || 'pending').toLowerCase() as WithdrawalStatus,
              rejectionReason: w.rejection_reason || w.rejectionReason,
              requestedAt: w.requested_at || w.createdAt || new Date().toISOString(),
              processedAt: w.processed_at || w.processedAt,
              transactionId: w.transaction_id || w.transactionId,
            };
          });
          return {
            items,
            page: pagination.page || page,
            limit: pagination.limit || limit,
            total: pagination.total || items.length,
            totalPages: pagination.totalPages || 1,
          };
        }
      }
    } catch {
      // Offline
    }
    _lastApiStatus = 'mock';
    return mockBackend.getWithdrawals(status, page, limit);
  },

  async cancelWithdrawal(id: string): Promise<{ success: boolean; message: string }> {
    if (!isUserLoggedIn()) {
      throw new Error('User is not logged in. Please log in first.');
    }
    try {
      const res = await fetch(`${API_BASE_URL}/withdrawals/${id}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const responseData = await res.json();
      if (!res.ok || responseData.success === false) {
        throw new Error(responseData.message || 'Failed to cancel withdrawal');
      }
      _lastApiStatus = 'live';
      return { success: true, message: responseData.message || 'Withdrawal cancelled.' };
    } catch (err: any) {
      if (!isNetworkError(err)) throw err;
      _lastApiStatus = 'mock';
      return mockBackend.cancelWithdrawal(id);
    }
  },
};
