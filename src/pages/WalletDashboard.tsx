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

// ─── Currency Card with animated count-up ───────────────────────────────────
const CurrencyCard: React.FC<{
  currKey: string;
  balance: number;
  loaded: boolean;
  onRedeem: () => void;
}> = ({ currKey, balance, loaded, onRedeem }) => {
  const config = CURRENCY_CONFIGS[currKey as CurrencyType];
  const isVe = currKey === 'VEs';
  const animatedBalance = useCountUp(balance, 1100, loaded);

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
        padding: '22px',
        background: config.gradient,
        border: `1px solid ${config.borderColor}`,
        position: 'relative',
        overflow: 'hidden',
        cursor: isVe ? 'pointer' : 'default',
      }}
      onClick={isVe ? onRedeem : undefined}
      title={isVe ? 'Click to redeem VEs' : config.description}
    >
      {/* Shine layer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* REDEEMABLE badge on VEs card */}
      {isVe && (
        <div style={{
          position: 'absolute', top: '11px', right: '11px',
          background: 'rgba(16, 185, 129, 0.18)',
          color: '#34D399', fontSize: '0.62rem', fontWeight: 800,
          padding: '3px 9px', borderRadius: '20px',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.5px',
        }}>
          <Sparkles style={{ width: '9px', height: '9px' }} />
          REDEEMABLE
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: 'rgba(7, 12, 24, 0.55)',
        border: `1px solid ${config.borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: config.color, marginBottom: '14px',
        boxShadow: `0 4px 12px ${config.borderColor}`,
      }}>
        {renderIcon()}
      </div>

      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {config.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px' }}>
        <span className="tabular-num" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f0f6ff', lineHeight: 1 }}>
          {loaded ? animatedBalance.toLocaleString() : '—'}
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: config.color }}>{config.symbol}</span>
      </div>

      {isVe && (
        <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowUpRight style={{ width: '11px', height: '11px' }} />
          Tap to redeem
        </div>
      )}
    </div>
  );
};

// ─── Stat Strip Tile ───────────────────────────────────────────────────────
const StatTile: React.FC<{
  label: string;
  value: string;
  color?: string;
  icon: React.ReactNode;
}> = ({ label, value, color = '#94a3b8', icon }) => (
  <div className="stat-tile">
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
      <span style={{ color }}>{icon}</span>
      <span className="stat-tile-label">{label}</span>
    </div>
    <div className="stat-tile-value tabular-num" style={{ color }}>
      {value}
    </div>
  </div>
);

// ─── Transaction Row ───────────────────────────────────────────────────────
const TxRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
  const isCredit = tx.type === 'credit';
  const currConfig = CURRENCY_CONFIGS[tx.currency] || CURRENCY_CONFIGS['VEs'];

  return (
    <div className="tx-row">
      {/* Left: Icon & description */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '13px', flex: 1, minWidth: 0 }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
          background: isCredit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
          border: `1px solid ${isCredit ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCredit ? '#10B981' : '#F43F5E',
        }}>
          {isCredit
            ? <ArrowDownLeft style={{ width: '19px', height: '19px' }} />
            : <ArrowUpRight   style={{ width: '19px', height: '19px' }} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: '#f0f6ff', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tx.description}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#4e6072', display: 'flex', alignItems: 'center', gap: '7px', marginTop: '2px', flexWrap: 'wrap' }}>
            <span>{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            {tx.referenceId && (
              <>
                <span>•</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>{tx.referenceId}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Status & Amount */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        <span className={`badge badge-${tx.status}`} style={{ display: 'none' }} />
        <div style={{ textAlign: 'right' }}>
          <div className="tabular-num" style={{
            fontWeight: 800, fontSize: '1rem',
            color: isCredit ? '#34D399' : '#F87171',
          }}>
            {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} {currConfig.symbol}
          </div>
          <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>
            <span className={`badge badge-${tx.status}`} style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
              {tx.status === 'pending' && <span className="pulse-dot" style={{ marginRight: '3px', width: '5px', height: '5px' }} />}
              {tx.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────
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

  // ─── Compute summary stats from transactions ───
  const totalCredited = transactionsData?.items
    .filter((t) => t.type === 'credit' && t.currency === 'VEs')
    .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  const totalWithdrawn = transactionsData?.items
    .filter((t) => t.type === 'debit' && t.currency === 'VEs')
    .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  const pendingCount = transactionsData?.items.filter((t) => t.status === 'pending').length ?? 0;

  // ─── Apply client-side filter ───
  const filteredTxItems = transactionsData?.items.filter((t) => {
    if (txFilter === 'credit') return t.type === 'credit';
    if (txFilter === 'debit')  return t.type === 'debit';
    return true;
  }) ?? [];

  return (
    <div className="app-container page-enter">

      {/* ── Error Banner ── */}
      {error && (
        <div className="error-banner">
          <div className="error-banner-content">
            <AlertTriangle style={{ width: '22px', height: '22px', color: '#F43F5E', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>Couldn't load your wallet</div>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          </div>
          <button onClick={() => loadData(page)} className="btn-secondary" style={{ background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '8px 14px', fontSize: '0.82rem' }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} /> Retry
          </button>
        </div>
      )}

      {/* ── Hero Row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f6ff', letterSpacing: '-0.5px' }}>
            Rewards Summary
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage earnings, tokens, gems — and redeem for real cash payouts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            id="wallet-history-btn"
            onClick={() => onNavigate('/withdrawals')}
            className="btn-secondary"
            style={{ fontSize: '0.88rem' }}
          >
            <History style={{ width: '16px', height: '16px' }} />
            History
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

      {/* ── 5 Currency Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
        gap: '14px', marginBottom: '24px',
      }}>
        {loading && !wallet
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ padding: '22px', height: '148px' }}>
                <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '12px', marginBottom: '14px' }} />
                <div className="skeleton" style={{ width: '75px', height: '13px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '110px', height: '30px' }} />
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

      {/* ── Analytics Summary Strip ── */}
      {(wallet || loading) && (
        <div className="stat-strip" style={{ marginBottom: '28px' }}>
          {loading && !wallet ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-tile">
                <div className="skeleton" style={{ width: '60px', height: '12px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '90px', height: '22px' }} />
              </div>
            ))
          ) : (
            <>
              <StatTile
                label="VEs Balance"
                value={(wallet?.balances.VEs ?? 0).toLocaleString() + ' VE'}
                color="#10B981"
                icon={<Zap style={{ width: '14px', height: '14px' }} />}
              />
              <StatTile
                label="This Page Credits"
                value={'+' + totalCredited.toLocaleString() + ' VE'}
                color="#34D399"
                icon={<TrendingUp style={{ width: '14px', height: '14px' }} />}
              />
              <StatTile
                label="This Page Debits"
                value={'-' + totalWithdrawn.toLocaleString() + ' VE'}
                color="#F87171"
                icon={<XCircle style={{ width: '14px', height: '14px' }} />}
              />
              <StatTile
                label="Pending"
                value={pendingCount === 0 ? 'None' : `${pendingCount} item${pendingCount > 1 ? 's' : ''}`}
                color={pendingCount > 0 ? '#FBBF24' : '#4e6072'}
                icon={<Clock style={{ width: '14px', height: '14px' }} />}
              />
            </>
          )}
        </div>
      )}

      {/* ── Transaction History Section ── */}
      <div className="glass-card" style={{ padding: '26px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0f6ff' }}>Transaction History</h2>
            <div style={{ fontSize: '0.8rem', color: '#4e6072', marginTop: '2px' }}>All credits, rewards, and payout debits</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter tabs */}
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
              style={{ padding: '7px 13px', fontSize: '0.8rem' }}
            >
              <RefreshCw style={{ width: '14px', height: '14px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Skeleton */}
        {loading && !transactionsData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '58px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : filteredTxItems.length === 0 ? (
          <div className="empty-state">
            <Layers className="empty-state-icon" />
            <h3>No Transactions Found</h3>
            <p>
              {txFilter !== 'all'
                ? `No ${txFilter === 'credit' ? 'credit' : 'debit'} transactions on this page. Try another filter.`
                : "You haven't earned or withdrawn any rewards yet. Engage with activities to start earning VEs!"}
            </p>
            {txFilter !== 'all' && (
              <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={() => setTxFilter('all')}>
                Show All
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTxItems.map((tx) => <TxRow key={tx.id} tx={tx} />)}
            </div>

            {/* Pagination */}
            {transactionsData && transactionsData.totalPages > 1 && txFilter === 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: '#4e6072' }}>
                  Page <strong style={{ color: '#94a3b8' }}>{transactionsData.page}</strong> of{' '}
                  <strong style={{ color: '#94a3b8' }}>{transactionsData.totalPages}</strong> — {transactionsData.total} total
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    id="tx-prev-page"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={transactionsData.page <= 1 || loading}
                    className="btn-secondary"
                    style={{ padding: '7px 13px', fontSize: '0.82rem' }}
                  >
                    <ChevronLeft style={{ width: '15px', height: '15px' }} /> Prev
                  </button>
                  <button
                    id="tx-next-page"
                    onClick={() => setPage((p) => Math.min(transactionsData.totalPages, p + 1))}
                    disabled={transactionsData.page >= transactionsData.totalPages || loading}
                    className="btn-secondary"
                    style={{ padding: '7px 13px', fontSize: '0.82rem' }}
                  >
                    Next <ChevronRight style={{ width: '15px', height: '15px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Quick link to full withdrawal history ── */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          id="wallet-view-withdrawals"
          onClick={() => onNavigate('/withdrawals')}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', color: '#8B5CF6', borderColor: 'rgba(139, 92, 246, 0.3)', background: 'rgba(139, 92, 246, 0.06)' }}
        >
          <CheckCircle style={{ width: '14px', height: '14px' }} />
          View Full Withdrawal History
        </button>
      </div>

    </div>
  );
};
