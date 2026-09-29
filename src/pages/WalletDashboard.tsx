import React, { useEffect, useState } from 'react';
import {
  Zap, ShieldCheck, Gem, Coins, RotateCw,
  ArrowUpRight, ArrowDownLeft, RefreshCw, AlertTriangle,
  ChevronLeft, ChevronRight, Layers, Sparkles,
  TrendingUp, Clock, CheckCircle, XCircle, History, Award, CreditCard,
  Search, Smartphone, ShoppingBag, Landmark, Lock, Gift, ExternalLink,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { CURRENCY_CONFIGS } from '../services/mockBackend';
import { useCountUp } from '../services/useCountUp';
import type { UserWallet, PaginatedTransactions, CurrencyType, Transaction } from '../types/rewards';

interface WalletDashboardProps {
  onNavigate: (path: string) => void;
  refreshTrigger: number;
}

// ─── Golden Currency Card Component ─────────────────────────────────────────
const CurrencyCard: React.FC<{
  currKey: string;
  balance: number;
  loaded: boolean;
  onRedeem: () => void;
}> = ({ currKey, balance, loaded, onRedeem }) => {
  const config = CURRENCY_CONFIGS[currKey as CurrencyType];
  const isVe = currKey === 'VEs';
  const animatedBalance = useCountUp(balance, 1100, loaded);

  // Golden Luxe Theme Translucent Card Styles & Accents
  const darkGradients: Record<string, { bg: string; border: string; color: string; iconBg: string; glowShadow: string }> = {
    VEs:    { bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(180, 83, 9, 0.08) 100%)',  border: 'rgba(245, 158, 11, 0.45)', color: '#fde047', iconBg: 'rgba(245, 158, 11, 0.25)', glowShadow: '0 0 20px rgba(245, 158, 11, 0.35)' },
    SVEs:   { bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(109, 40, 217, 0.06) 100%)', border: 'rgba(168, 85, 247, 0.4)', color: '#c084fc', iconBg: 'rgba(168, 85, 247, 0.22)', glowShadow: '0 0 20px rgba(168, 85, 247, 0.25)' },
    Gems:   { bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(190, 18, 60, 0.06) 100%)',   border: 'rgba(244, 63, 94, 0.4)',  color: '#fda4af', iconBg: 'rgba(244, 63, 94, 0.22)',  glowShadow: '0 0 20px rgba(244, 63, 94, 0.25)' },
    Tokens: { bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(180, 83, 9, 0.06) 100%)',  border: 'rgba(251, 191, 36, 0.4)', color: '#fef08a', iconBg: 'rgba(251, 191, 36, 0.22)', glowShadow: '0 0 20px rgba(251, 191, 36, 0.25)' },
    Spins:  { bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(3, 105, 161, 0.06) 100%)',   border: 'rgba(6, 182, 212, 0.4)',  color: '#38bdf8', iconBg: 'rgba(6, 182, 212, 0.22)',  glowShadow: '0 0 20px rgba(6, 182, 212, 0.25)' },
  };

  const lg = darkGradients[currKey] || darkGradients.VEs;

  const renderIcon = () => {
    const style = { width: '22px', height: '22px' };
    switch (config.iconName) {
      case 'Zap':        return <Zap style={style} />;
      case 'ShieldCheck': return <ShieldCheck style={style} />;
      case 'Gem':        return <Gem style={style} />;
      case 'Coins':      return <Coins style={style} />;
      case 'RotateCw':   return <RotateCw style={style} />;
      default:           return <Zap style={style} />;
    }
  };

  return (
    <div
      className={`glass-card glass-card-interactive ${config.glowClass}`}
      style={{
        padding: '22px 20px',
        background: lg.bg,
        border: `1px solid ${lg.border}`,
        position: 'relative',
        overflow: 'hidden',
        cursor: isVe ? 'pointer' : 'default',
        borderRadius: '22px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
      }}
      onClick={isVe ? onRedeem : undefined}
      title={isVe ? 'Click to redeem VEs for instant cash payouts' : config.description}
    >
      {/* Metallic Gold Foil Shine Accent */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* REDEEMABLE badge */}
      {isVe && (
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'rgba(245, 158, 11, 0.25)',
          color: '#fde047', fontSize: '0.62rem', fontWeight: 900,
          padding: '4px 10px', borderRadius: '20px',
          border: '1px solid rgba(253, 224, 71, 0.6)',
          display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.6px',
          boxShadow: '0 0 14px rgba(245, 158, 11, 0.4)',
        }}>
          <Sparkles style={{ width: '10px', height: '10px' }} />
          REDEEMABLE
        </div>
      )}

      {/* Icon Frame */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '14px',
        background: lg.iconBg,
        border: `1px solid ${lg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: lg.color, marginBottom: '16px',
        boxShadow: lg.glowShadow,
      }}>
        {renderIcon()}
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {config.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
        <span className="tabular-num" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', lineHeight: 1, fontFamily: 'var(--font-mono)' }}>
          {loaded ? animatedBalance.toLocaleString() : '—'}
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 900, color: lg.color }}>{config.symbol}</span>
      </div>

      {isVe && (
        <div style={{ marginTop: '12px', fontSize: '0.76rem', color: '#fde047', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowUpRight style={{ width: '13px', height: '13px' }} />
          Click to Cash Out
        </div>
      )}
    </div>
  );
};

// ─── Stat Tile Component ───────────────────────────────────────────────────
const StatTile: React.FC<{
  label: string;
  value: string;
  subtext?: string;
  color?: string;
  icon: React.ReactNode;
}> = ({ label, value, subtext, color = '#cbd5e1', icon }) => (
  <div className="stat-tile">
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
      <span style={{ color, display: 'flex' }}>{icon}</span>
      <span className="stat-tile-label">{label}</span>
    </div>
    <div className="stat-tile-value tabular-num" style={{ color: '#ffffff' }}>
      {value}
    </div>
    {subtext && (
      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
        {subtext}
      </div>
    )}
  </div>
);

// ─── Transaction Row Component ─────────────────────────────────────────────
const TxRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
  const isCredit = tx.type === 'credit';
  const currConfig = CURRENCY_CONFIGS[tx.currency] || CURRENCY_CONFIGS['VEs'];

  return (
    <div className="tx-row">
      {/* Left: Icon & Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
          background: isCredit ? 'rgba(245, 158, 11, 0.18)' : 'rgba(244, 63, 94, 0.18)',
          border: `1px solid ${isCredit ? 'rgba(245, 158, 11, 0.45)' : 'rgba(244, 63, 94, 0.4)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCredit ? '#fde047' : '#fda4af',
          boxShadow: `0 0 12px ${isCredit ? 'rgba(245, 158, 11, 0.25)' : 'rgba(244, 63, 94, 0.2)'}`,
        }}>
          {isCredit
            ? <ArrowDownLeft style={{ width: '20px', height: '20px' }} />
            : <ArrowUpRight   style={{ width: '20px', height: '20px' }} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.94rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tx.description}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
            <span>{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            {tx.referenceId && (
              <>
                <span>•</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#fde047', background: 'rgba(245, 158, 11, 0.12)', padding: '1px 6px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>{tx.referenceId}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Amount & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div className="tabular-num" style={{
            fontWeight: 900, fontSize: '1.05rem',
            color: isCredit ? '#fde047' : '#fda4af',
          }}>
            {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} {currConfig.symbol}
          </div>
          <div style={{ fontSize: '0.7rem', marginTop: '3px' }}>
            <span className={`badge badge-${tx.status}`} style={{ fontSize: '0.64rem', padding: '2px 7px' }}>
              {tx.status === 'pending' && <span className="pulse-dot" style={{ marginRight: '4px', width: '5px', height: '5px' }} />}
              {tx.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard Component ──────────────────────────────────────────────
type TxFilter = 'all' | 'credit' | 'debit';

export const WalletDashboard: React.FC<WalletDashboardProps> = ({ onNavigate, refreshTrigger }) => {
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactionsData, setTransactionsData] = useState<PaginatedTransactions | null>(null);
  const [page, setPage] = useState(1);
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadData = async (targetPage = page) => {
    if (!localStorage.getItem('veloop_access_token')) {
      onNavigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [walletRes, txRes] = await Promise.all([
        apiClient.getWallet(),
        apiClient.getTransactions(targetPage, 6),
      ]);
      setWallet(walletRes);
      setTransactionsData(txRes);
      setLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(page); }, [page, refreshTrigger]);

  const animatedVeBalance = useCountUp(wallet?.balances.VEs ?? 0, 1200, loaded);

  // Conversion: 100 VEs = ₹1.00 or ₹10.00
  const estimatedRupees = ((wallet?.balances.VEs ?? 0) / 100).toFixed(2);

  const totalCredited = transactionsData?.items
    .filter((t) => t.type === 'credit' && t.currency === 'VEs')
    .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  const totalWithdrawn = transactionsData?.items
    .filter((t) => t.type === 'debit' && t.currency === 'VEs')
    .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  const pendingCount = transactionsData?.items.filter((t) => t.status === 'pending').length ?? 0;

  const filteredTxItems = (transactionsData?.items ?? []).filter((t) => {
    // Type filter
    if (txFilter === 'credit' && t.type !== 'credit') return false;
    if (txFilter === 'debit'  && t.type !== 'debit')  return false;
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchRef  = t.referenceId?.toLowerCase().includes(q) ?? false;
      const matchCat  = t.category?.toLowerCase().includes(q) ?? false;
      return matchDesc || matchRef || matchCat;
    }
    return true;
  });

  return (
    <div className="app-container page-enter">

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="error-banner-content">
            <AlertTriangle style={{ width: '22px', height: '22px', color: '#fda4af', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fda4af' }}>Couldn't load your wallet</div>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          </div>
          <button onClick={() => loadData(page)} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem', color: '#fda4af' }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} /> Retry
          </button>
        </div>
      )}

      {/* Dashboard Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fde047', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '6px' }}>
            <span className="pulse-dot" style={{ background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
            LIVE REWARDS DASHBOARD
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
            Wallet &amp; Payouts
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginTop: '4px', maxWidth: '540px' }}>
            Track your reward balances, earn bonus VEs, and redeem instantly for bank cash &amp; gift vouchers.
          </p>
        </div>

        {/* Top Header Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            id="wallet-history-btn"
            onClick={() => onNavigate('/withdrawals')}
            className="btn-secondary"
          >
            <History style={{ width: '16px', height: '16px', color: '#fde047' }} />
            Withdrawal History
          </button>
          <button
            id="wallet-redeem-btn"
            onClick={() => onNavigate('/payout')}
            className="btn-primary"
            style={{ padding: '13px 26px' }}
          >
            <ArrowUpRight style={{ width: '18px', height: '18px' }} />
            Withdraw Cash
          </button>
        </div>
      </div>

      {/* Golden Luxe VIP Master Card */}
      {wallet && (
        <div className="vip-master-card">
          <div className="vip-foil-stripe" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.22)', border: '1px solid rgba(253, 224, 71, 0.5)', color: '#fde047', fontSize: '0.7rem', fontWeight: 900, padding: '4px 14px', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '14px', boxShadow: '0 0 16px rgba(245, 158, 11, 0.35)' }}>
                <Award style={{ width: '13px', height: '13px' }} />
                {wallet.tier.toUpperCase()} REWARDS MEMBER
              </div>

              <div style={{ fontSize: '0.84rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.9px', fontWeight: 800 }}>
                Total Redeemable VEs Balance
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span className="tabular-num" style={{ fontSize: '3.1rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  {loaded ? animatedVeBalance.toLocaleString() : wallet.balances.VEs.toLocaleString()}
                </span>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fde047', letterSpacing: '0.5px' }}>VEs</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.08)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  ≈ ₹{estimatedRupees} INR Cash
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}>
                <CreditCard style={{ width: '16px', height: '16px', color: '#fde047' }} />
                <span>Account: <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{wallet.userId}</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigate('/payout')}
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '0.92rem' }}
                >
                  <Zap style={{ width: '16px', height: '16px', fill: '#ffffff' }} />
                  Instant Cash Redeem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5 Currency Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '14px', marginBottom: '28px',
      }}>
        {loading && !wallet
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ padding: '20px', height: '145px' }}>
                <div className="skeleton" style={{ width: '42px', height: '42px', borderRadius: '12px', marginBottom: '14px' }} />
                <div className="skeleton" style={{ width: '70px', height: '12px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '95px', height: '26px' }} />
              </div>
            ))
          : wallet
            ? Object.keys(CURRENCY_CONFIGS).map((currKey) => (
                <CurrencyCard
                  key={currKey}
                  currKey={currKey}
                  balance={wallet.balances[currKey as CurrencyType] ?? 0}
                  loaded={loaded}
                  onRedeem={() => onNavigate('/payout')}
                />
              ))
            : null}
      </div>

      {/* Analytics Metric Tiles */}
      {(wallet || loading) && (
        <div className="stat-strip">
          {loading && !wallet ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-tile">
                <div className="skeleton" style={{ width: '65px', height: '12px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '95px', height: '24px' }} />
              </div>
            ))
          ) : (
            <>
              <StatTile
                label="VEs Balance"
                value={(wallet?.balances.VEs ?? 0).toLocaleString() + ' VE'}
                subtext={`Equivalent to ₹${estimatedRupees}`}
                color="#fde047"
                icon={<Zap style={{ width: '16px', height: '16px' }} />}
              />
              <StatTile
                label="Recent Credits"
                value={'+' + totalCredited.toLocaleString() + ' VE'}
                subtext="Total earnings on this page"
                color="#10b981"
                icon={<TrendingUp style={{ width: '16px', height: '16px' }} />}
              />
              <StatTile
                label="Recent Debits"
                value={'-' + totalWithdrawn.toLocaleString() + ' VE'}
                subtext="Total cashouts on this page"
                color="#fda4af"
                icon={<XCircle style={{ width: '16px', height: '16px' }} />}
              />
              <StatTile
                label="Pending Payouts"
                value={pendingCount === 0 ? 'None' : `${pendingCount} item${pendingCount > 1 ? 's' : ''}`}
                subtext={pendingCount > 0 ? 'Processing settlements' : 'All payouts cleared'}
                color={pendingCount > 0 ? '#fde047' : '#cbd5e1'}
                icon={<Clock style={{ width: '16px', height: '16px' }} />}
              />
            </>
          )}
        </div>
      )}

      {/* Quick Instant Redemption Hub */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift style={{ width: '20px', height: '20px', color: '#fde047' }} />
              Instant Redemption Channels
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '2px' }}>
              Select your preferred channel to receive instant money directly into your account.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/payout')}
            className="btn-ghost"
            style={{ color: '#fde047', fontSize: '0.84rem' }}
          >
            Explore All Methods <ExternalLink style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* UPI */}
          <div
            onClick={() => onNavigate('/payout')}
            style={{
              background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '16px', padding: '16px', cursor: 'pointer',
              transition: 'all 0.22s ease', display: 'flex', alignItems: 'center', gap: '14px'
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = '#fde047'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 158, 11, 0.35)'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.25)', border: '1px solid rgba(253, 224, 71, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fde047', flexShrink: 0 }}>
              <Smartphone style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.94rem' }}>UPI Direct Transfer</div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '2px' }}>GPay, PhonePe, Paytm (Instant)</div>
            </div>
          </div>

          {/* Amazon Pay */}
          <div
            onClick={() => onNavigate('/payout')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '16px', padding: '16px', cursor: 'pointer',
              transition: 'all 0.22s ease', display: 'flex', alignItems: 'center', gap: '14px'
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = '#fde047'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.14)'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.2)', border: '1px solid rgba(251, 191, 36, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>
              <ShoppingBag style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.94rem' }}>Amazon Gift Code</div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '2px' }}>Instant Email Voucher Code</div>
            </div>
          </div>

          {/* Bank IMPS */}
          <div
            onClick={() => onNavigate('/payout')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '16px', padding: '16px', cursor: 'pointer',
              transition: 'all 0.22s ease', display: 'flex', alignItems: 'center', gap: '14px'
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = '#fde047'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.14)'; }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
              <Landmark style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.94rem' }}>Bank IMPS Transfer</div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '2px' }}>Direct to Account + IFSC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="glass-card" style={{ padding: '28px' }}>

        {/* Section Header & Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>Transaction Ledger</h2>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '3px' }}>All earned rewards, credits, and payout cashouts</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input Box */}
            <div style={{ position: 'relative', minWidth: '180px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(10, 16, 30, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '10px',
                  padding: '7px 12px 7px 34px',
                  fontSize: '0.82rem',
                  color: '#ffffff',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              {(['all', 'credit', 'debit'] as TxFilter[]).map((f) => (
                <button
                  key={f}
                  id={`tx-filter-${f}`}
                  className={`filter-tab${txFilter === f ? ' active' : ''}`}
                  onClick={() => {
                    if (!localStorage.getItem('veloop_access_token')) {
                      onNavigate('/login');
                      return;
                    }
                    setTxFilter(f);
                  }}
                >
                  {f === 'all' ? 'All' : f === 'credit' ? '↓ Credits' : '↑ Debits'}
                </button>
              ))}
            </div>

            <button
              id="wallet-refresh-btn"
              onClick={() => loadData(page)}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <RefreshCw style={{ width: '14px', height: '14px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* List or Skeleton */}
        {loading && !transactionsData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '62px', borderRadius: '14px' }} />
            ))}
          </div>
        ) : filteredTxItems.length === 0 ? (
          <div className="empty-state">
            <Layers className="empty-state-icon" />
            <h3>No Transactions Found</h3>
            <p>
              {searchQuery.trim()
                ? `No transactions matching "${searchQuery}". Try clearing your search query.`
                : txFilter !== 'all'
                ? `No ${txFilter === 'credit' ? 'credit' : 'debit'} transactions on this page. Try changing your filter.`
                : "You haven't earned or withdrawn any rewards yet. Participate in activities to start earning VEs!"}
            </p>
            {(txFilter !== 'all' || searchQuery) && (
              <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={() => { setTxFilter('all'); setSearchQuery(''); }}>
                Clear Filters &amp; Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {filteredTxItems.map((tx) => <TxRow key={tx.id} tx={tx} />)}
            </div>

            {/* Pagination Controls */}
            {transactionsData && transactionsData.totalPages > 1 && txFilter === 'all' && !searchQuery && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  Page <strong style={{ color: '#ffffff' }}>{transactionsData.page}</strong> of{' '}
                  <strong style={{ color: '#ffffff' }}>{transactionsData.totalPages}</strong> — {transactionsData.total} total
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    id="tx-prev-page"
                    onClick={() => {
                      if (!localStorage.getItem('veloop_access_token')) {
                        onNavigate('/login');
                        return;
                      }
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    disabled={transactionsData.page <= 1 || loading}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                  >
                    <ChevronLeft style={{ width: '15px', height: '15px' }} /> Prev
                  </button>
                  <button
                    id="tx-next-page"
                    onClick={() => {
                      if (!localStorage.getItem('veloop_access_token')) {
                        onNavigate('/login');
                        return;
                      }
                      setPage((p) => Math.min(transactionsData.totalPages, p + 1));
                    }}
                    disabled={transactionsData.page >= transactionsData.totalPages || loading}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                  >
                    Next <ChevronRight style={{ width: '15px', height: '15px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bank-Grade Security Guarantee Banner */}
      <div style={{
        marginTop: '24px',
        padding: '16px 20px',
        borderRadius: '16px',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Lock style={{ width: '20px', height: '20px', color: '#fde047', flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            <strong style={{ color: '#ffffff' }}>Bank-Grade Security Guaranteed:</strong> 256-Bit SSL Encrypted Settlements • Direct UPI &amp; IMPS Integration • Instant 2-Minute Deposit Guarantee.
          </div>
        </div>

        <button
          id="wallet-view-withdrawals"
          onClick={() => onNavigate('/withdrawals')}
          className="btn-ghost"
          style={{ fontSize: '0.82rem', color: '#fde047' }}
        >
          <CheckCircle style={{ width: '14px', height: '14px' }} />
          View Withdrawal Timeline
        </button>
      </div>

    </div>
  );
};
