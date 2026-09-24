import React, { useEffect, useState } from 'react';
import {
  Zap, ShieldCheck, Gem, Coins, RotateCw,
  ArrowUpRight, ArrowDownLeft, RefreshCw, AlertTriangle,
  ChevronLeft, ChevronRight, Layers, Sparkles,
  TrendingUp, Clock, CheckCircle, XCircle, History,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { CURRENCY_CONFIGS } from '../services/mockBackend';
import { useCountUp } from '../services/useCountUp';
import type { UserWallet, PaginatedTransactions, CurrencyType, Transaction } from '../types/rewards';

interface WalletDashboardProps {
  onNavigate: (path: string) => void;
  refreshTrigger: number;
}

// ─── Light Currency Card Component ─────────────────────────────────────────
const CurrencyCard: React.FC<{
  currKey: string;
  balance: number;
  loaded: boolean;
  onRedeem: () => void;
}> = ({ currKey, balance, loaded, onRedeem }) => {
  const config = CURRENCY_CONFIGS[currKey as CurrencyType];
  const isVe = currKey === 'VEs';
  const animatedBalance = useCountUp(balance, 1100, loaded);

  // Custom light gradient for each currency
  const lightGradients: Record<string, { bg: string; border: string; color: string }> = {
    VEs:    { bg: 'linear-gradient(135deg, rgba(236, 253, 245, 0.95) 0%, rgba(209, 250, 229, 0.85) 100%)', border: 'rgba(16, 185, 129, 0.35)', color: '#047857' },
    SVEs:   { bg: 'linear-gradient(135deg, rgba(245, 243, 255, 0.95) 0%, rgba(237, 233, 254, 0.85) 100%)', border: 'rgba(139, 92, 246, 0.35)', color: '#6d28d9' },
    Gems:   { bg: 'linear-gradient(135deg, rgba(255, 241, 242, 0.95) 0%, rgba(254, 226, 226, 0.85) 100%)', border: 'rgba(244, 63, 94, 0.35)',  color: '#be123c' },
    Tokens: { bg: 'linear-gradient(135deg, rgba(254, 252, 232, 0.95) 0%, rgba(254, 243, 199, 0.85) 100%)', border: 'rgba(245, 158, 11, 0.35)', color: '#b45309' },
    Spins:  { bg: 'linear-gradient(135deg, rgba(236, 254, 255, 0.95) 0%, rgba(207, 250, 254, 0.85) 100%)', border: 'rgba(6, 182, 212, 0.35)',  color: '#0369a1' },
  };

  const lg = lightGradients[currKey] || lightGradients.VEs;

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
        padding: '20px 18px',
        background: lg.bg,
        border: `1px solid ${lg.border}`,
        position: 'relative',
        overflow: 'hidden',
        cursor: isVe ? 'pointer' : 'default',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
      }}
      onClick={isVe ? onRedeem : undefined}
      title={isVe ? 'Click to redeem VEs for cash payouts' : config.description}
    >
      {/* Shine Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* REDEEMABLE badge */}
      {isVe && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(16, 185, 129, 0.16)',
          color: '#047857', fontSize: '0.62rem', fontWeight: 900,
          padding: '3px 9px', borderRadius: '20px',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.5px',
        }}>
          <Sparkles style={{ width: '9px', height: '9px' }} />
          REDEEM
        </div>
      )}

      {/* Icon Frame */}
      <div style={{
        width: '42px', height: '42px', borderRadius: '12px',
        background: '#ffffff',
        border: `1px solid ${lg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: lg.color, marginBottom: '14px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
      }}>
        {renderIcon()}
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {config.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
        <span className="tabular-num" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', lineHeight: 1, fontFamily: 'var(--font-mono)' }}>
          {loaded ? animatedBalance.toLocaleString() : '—'}
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: lg.color }}>{config.symbol}</span>
      </div>

      {isVe && (
        <div style={{ marginTop: '10px', fontSize: '0.74rem', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowUpRight style={{ width: '12px', height: '12px' }} />
          Tap to redeem
        </div>
      )}
    </div>
  );
};

// ─── Stat Tile Component ───────────────────────────────────────────────────
const StatTile: React.FC<{
  label: string;
  value: string;
  color?: string;
  icon: React.ReactNode;
}> = ({ label, value, color = '#475569', icon }) => (
  <div className="stat-tile">
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
      <span style={{ color, display: 'flex' }}>{icon}</span>
      <span className="stat-tile-label">{label}</span>
    </div>
    <div className="stat-tile-value tabular-num" style={{ color: '#0f172a' }}>
      {value}
    </div>
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
          background: isCredit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
          border: `1px solid ${isCredit ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCredit ? '#059669' : '#e11d48',
        }}>
          {isCredit
            ? <ArrowDownLeft style={{ width: '20px', height: '20px' }} />
            : <ArrowUpRight   style={{ width: '20px', height: '20px' }} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tx.description}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
            <span>{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            {tx.referenceId && (
              <>
                <span>•</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#475569' }}>{tx.referenceId}</span>
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
            color: isCredit ? '#059669' : '#e11d48',
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

  const totalCredited = transactionsData?.items
    .filter((t) => t.type === 'credit' && t.currency === 'VEs')
    .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  const totalWithdrawn = transactionsData?.items
    .filter((t) => t.type === 'debit' && t.currency === 'VEs')
    .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  const pendingCount = transactionsData?.items.filter((t) => t.status === 'pending').length ?? 0;

  const filteredTxItems = transactionsData?.items.filter((t) => {
    if (txFilter === 'credit') return t.type === 'credit';
    if (txFilter === 'debit')  return t.type === 'debit';
    return true;
  }) ?? [];

  return (
    <div className="app-container page-enter">

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="error-banner-content">
            <AlertTriangle style={{ width: '22px', height: '22px', color: '#e11d48', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#9f1239' }}>Couldn't load your wallet</div>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          </div>
          <button onClick={() => loadData(page)} className="btn-secondary" style={{ background: '#ffffff', borderColor: '#fca5a5', padding: '8px 14px', fontSize: '0.82rem', color: '#be123c' }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} /> Retry
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Rewards Summary
          </h1>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage your VEs earnings, tokens, gems — and redeem for instant payouts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            id="wallet-history-btn"
            onClick={() => onNavigate('/withdrawals')}
            className="btn-secondary"
            style={{ fontSize: '0.88rem' }}
          >
            <History style={{ width: '16px', height: '16px' }} />
            Withdrawal History
          </button>
          <button
            id="wallet-redeem-btn"
            onClick={() => onNavigate('/payout')}
            className="btn-primary"
            style={{ fontSize: '0.98rem', padding: '13px 26px' }}
          >
            <ArrowUpRight style={{ width: '18px', height: '18px' }} />
            Withdraw / Redeem
          </button>
        </div>
      </div>

      {/* 5 Currency Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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

      {/* Analytics Strip */}
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
                color="#059669"
                icon={<Zap style={{ width: '15px', height: '15px' }} />}
              />
              <StatTile
                label="This Page Credits"
                value={'+' + totalCredited.toLocaleString() + ' VE'}
                color="#047857"
                icon={<TrendingUp style={{ width: '15px', height: '15px' }} />}
              />
              <StatTile
                label="This Page Debits"
                value={'-' + totalWithdrawn.toLocaleString() + ' VE'}
                color="#e11d48"
                icon={<XCircle style={{ width: '15px', height: '15px' }} />}
              />
              <StatTile
                label="Pending Items"
                value={pendingCount === 0 ? 'None' : `${pendingCount} item${pendingCount > 1 ? 's' : ''}`}
                color={pendingCount > 0 ? '#b45309' : '#64748b'}
                icon={<Clock style={{ width: '15px', height: '15px' }} />}
              />
            </>
          )}
        </div>
      )}

      {/* Transaction History Section */}
      <div className="glass-card" style={{ padding: '28px' }}>

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>Transaction History</h2>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>All earned rewards, credits, and payout debits</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter Tabs */}
            <div className="filter-tabs">
              {(['all', 'credit', 'debit'] as TxFilter[]).map((f) => (
                <button
                  key={f}
                  id={`tx-filter-${f}`}
                  className={`filter-tab${txFilter === f ? ' active' : ''}`}
                  onClick={() => setTxFilter(f)}
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
              {txFilter !== 'all'
                ? `No ${txFilter === 'credit' ? 'credit' : 'debit'} transactions on this page. Try changing your filter.`
                : "You haven't earned or withdrawn any rewards yet. Participate in activities to start earning VEs!"}
            </p>
            {txFilter !== 'all' && (
              <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={() => setTxFilter('all')}>
                Show All Transactions
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {filteredTxItems.map((tx) => <TxRow key={tx.id} tx={tx} />)}
            </div>

            {/* Pagination Controls */}
            {transactionsData && transactionsData.totalPages > 1 && txFilter === 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid rgba(226, 232, 240, 0.9)' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Page <strong style={{ color: '#0f172a' }}>{transactionsData.page}</strong> of{' '}
                  <strong style={{ color: '#0f172a' }}>{transactionsData.totalPages}</strong> — {transactionsData.total} total
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    id="tx-prev-page"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={transactionsData.page <= 1 || loading}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                  >
                    <ChevronLeft style={{ width: '15px', height: '15px' }} /> Prev
                  </button>
                  <button
                    id="tx-next-page"
                    onClick={() => setPage((p) => Math.min(transactionsData.totalPages, p + 1))}
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

      {/* Quick Link Footer */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          id="wallet-view-withdrawals"
          onClick={() => onNavigate('/withdrawals')}
          className="btn-secondary"
          style={{ fontSize: '0.85rem', color: '#7c3aed', borderColor: 'rgba(124, 58, 237, 0.3)', background: 'rgba(124, 58, 237, 0.06)' }}
        >
          <CheckCircle style={{ width: '15px', height: '15px' }} />
          View Complete Withdrawal Timeline
        </button>
      </div>

    </div>
  );
};
