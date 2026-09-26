import React, { useEffect, useState, useCallback } from 'react';
import {
  History, RefreshCw, AlertTriangle, Smartphone, ShoppingBag, Play,
  ChevronLeft, ChevronRight, X, CheckCircle2, XCircle, Clock,
  Layers, ArrowLeft, Zap, Ban,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import type { Withdrawal, WithdrawalStatus, PaginatedWithdrawals } from '../types/rewards';

interface WithdrawalsPageProps {
  onNavigate: (path: string) => void;
  onWalletRefresh: () => void;
}

// ─── Status Config (Dark Glow) ──────────────────────────────────────────────
const STATUS_CONFIG: Record<WithdrawalStatus, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: '#fde047', bg: 'rgba(245, 158, 11, 0.18)', border: 'rgba(245, 158, 11, 0.4)', Icon: Clock },
  processing: { label: 'Processing', color: '#38bdf8', bg: 'rgba(6, 182, 212, 0.18)',  border: 'rgba(6, 182, 212, 0.4)',  Icon: RefreshCw },
  approved:   { label: 'Approved',   color: '#34d399', bg: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.4)', Icon: CheckCircle2 },
  rejected:   { label: 'Rejected',   color: '#fda4af', bg: 'rgba(244, 63, 94, 0.18)',  border: 'rgba(244, 63, 94, 0.4)',  Icon: XCircle },
  cancelled:  { label: 'Cancelled',  color: '#cbd5e1', bg: 'rgba(148, 163, 184, 0.18)', border: 'rgba(148, 163, 184, 0.3)', Icon: Ban },
};

const METHOD_ICONS: Record<string, React.ElementType> = {
  upi: Smartphone,
  amazon_gift: ShoppingBag,
  google_play: Play,
};

const METHOD_COLORS: Record<string, string> = {
  upi: '#34d399',
  amazon_gift: '#fbbf24',
  google_play: '#c084fc',
};

// ─── Withdrawal Timeline Card Component ─────────────────────────────────────
const WithdrawalCard: React.FC<{
  w: Withdrawal;
  onCancel: (id: string) => void;
  cancelling: string | null;
}> = ({ w, onCancel, cancelling }) => {
  const sc = STATUS_CONFIG[w.status] ?? STATUS_CONFIG.pending;
  const MethodIcon = METHOD_ICONS[w.method] ?? Smartphone;
  const methodColor = METHOD_COLORS[w.method] ?? '#34d399';
  const isCancelling = cancelling === w.id;

  return (
    <div
      className="withdrawal-item"
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* Method Icon */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
          background: `rgba(${methodColor === '#34d399' ? '52,211,153' : methodColor === '#fbbf24' ? '251,191,36' : '192,132,252'}, 0.16)`,
          border: `1px solid ${methodColor}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: methodColor,
          boxShadow: `0 0 14px ${methodColor}30`,
        }}>
          <MethodIcon style={{ width: '24px', height: '24px' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>{w.methodLabel}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="tabular-num" style={{ fontWeight: 900, fontSize: '1.15rem', color: '#f8fafc' }}>
                {w.currencySymbol}{w.payoutAmount}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 11px', borderRadius: '20px',
                fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px',
                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
              }}>
                {w.status === 'pending' && <span className="pulse-dot" style={{ width: '5px', height: '5px' }} />}
                {w.status === 'processing' && <RefreshCw style={{ width: '11px', height: '11px', animation: 'spin 1s linear infinite' }} />}
                {sc.label}
              </span>
            </div>
          </div>

          {/* Details Row */}
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span>To: <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>{w.recipientDetail}</strong></span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap style={{ width: '12px', height: '12px', color: '#fda4af' }} />
              <span style={{ color: '#fda4af', fontWeight: 800 }}>{w.requiredVEs.toLocaleString()} VEs</span>
            </span>
            {w.transactionId && (
              <>
                <span>•</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#64748b' }}>#{w.transactionId}</span>
              </>
            )}
          </div>

          {/* Dates */}
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '6px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <span>
              Requested:{' '}
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                {new Date(w.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </span>
            {w.processedAt && (
              <span>
                Processed:{' '}
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                  {new Date(w.processedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
            )}
          </div>

          {/* Rejection notice */}
          {w.status === 'rejected' && w.rejectionReason && (
            <div style={{
              marginTop: '12px', padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.35)',
              fontSize: '0.8rem', color: '#fda4af', display: 'flex', gap: '8px', fontWeight: 600,
            }}>
              <AlertTriangle style={{ width: '15px', height: '15px', flexShrink: 0, marginTop: '1px', color: '#fda4af' }} />
              <span>{w.rejectionReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cancel action */}
      {w.status === 'pending' && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id={`cancel-withdrawal-${w.id}`}
            onClick={() => onCancel(w.id)}
            disabled={isCancelling}
            className="btn-danger"
            style={{ fontSize: '0.82rem' }}
          >
            {isCancelling
              ? <><RefreshCw style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> Cancelling...</>
              : <><X style={{ width: '14px', height: '14px' }} /> Cancel Request</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Withdrawals Page Component ───────────────────────────────────────
type StatusFilter = WithdrawalStatus | 'all';

export const WithdrawalsPage: React.FC<WithdrawalsPageProps> = ({ onNavigate, onWalletRefresh }) => {
  const [data, setData] = useState<PaginatedWithdrawals | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadWithdrawals = useCallback(async (targetPage = 1, filter: StatusFilter = statusFilter) => {
    if (!localStorage.getItem('veloop_access_token')) {
      onNavigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.getWithdrawals(filter, targetPage, 8);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load withdrawal history.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, onNavigate]);

  useEffect(() => {
    loadWithdrawals(page, statusFilter);
  }, [page, statusFilter]);

  const handleFilterChange = (f: StatusFilter) => {
    if (!localStorage.getItem('veloop_access_token')) {
      onNavigate('/login');
      return;
    }
    setStatusFilter(f);
    setPage(1);
    loadWithdrawals(1, f);
  };

  const handleCancel = async (id: string) => {
    if (!localStorage.getItem('veloop_access_token')) {
      onNavigate('/login');
      return;
    }
    if (!window.confirm('Are you sure you want to cancel this withdrawal request? Your VEs will be restored to your balance.')) return;
    setCancelling(id);
    try {
      const result = await apiClient.cancelWithdrawal(id);
      showToast('success', result.message);
      loadWithdrawals(page);
      onWalletRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to cancel withdrawal.');
    } finally {
      setCancelling(null);
    }
  };

  const filterTabs: { key: StatusFilter; label: string; color?: string }[] = [
    { key: 'all',        label: 'All Requests' },
    { key: 'pending',    label: '⏳ Pending',    color: '#fde047' },
    { key: 'processing', label: '⚡ Processing',  color: '#38bdf8' },
    { key: 'approved',   label: '✓ Approved',    color: '#34d399' },
    { key: 'rejected',   label: '✕ Rejected',    color: '#fda4af' },
    { key: 'cancelled',  label: '⊘ Cancelled',   color: '#cbd5e1' },
  ];

  return (
    <div className="app-container page-enter" style={{ maxWidth: '880px' }}>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success'
              ? <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              : <AlertTriangle style={{ width: '18px', height: '18px', flexShrink: 0 }} />}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => onNavigate('/wallet')}
            className="btn-secondary"
            style={{ padding: '9px 15px', fontSize: '0.85rem' }}
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />
            Wallet
          </button>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History style={{ width: '24px', height: '24px', color: '#c084fc' }} />
              Withdrawal History
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2px' }}>
              Track all payout requests and their live statuses.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            id="withdrawals-refresh-btn"
            onClick={() => loadWithdrawals(page)}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '9px 15px' }}
          >
            <RefreshCw style={{ width: '14px', height: '14px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            id="withdrawals-new-payout-btn"
            onClick={() => onNavigate('/payout')}
            className="btn-primary"
            style={{ fontSize: '0.9rem' }}
          >
            + New Payout
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="error-banner-content">
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#fda4af', flexShrink: 0 }} />
            <p>{error}</p>
          </div>
          <button onClick={() => loadWithdrawals(page)} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '7px 12px', color: '#fda4af' }}>
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div style={{ marginBottom: '22px', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="filter-tabs" style={{ width: 'max-content', minWidth: '100%' }}>
          {filterTabs.map(({ key, label, color }) => (
            <button
              key={key}
              id={`filter-tab-${key}`}
              className={`filter-tab${statusFilter === key ? ' active' : ''}`}
              style={statusFilter === key && color ? { color } : undefined}
              onClick={() => handleFilterChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '104px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="empty-state">
            <Layers className="empty-state-icon" />
            <h3>
              {statusFilter === 'all' ? 'No Withdrawals Yet' : `No ${statusFilter} withdrawals`}
            </h3>
            <p>
              {statusFilter === 'all'
                ? "You haven't made any withdrawal requests yet. Head to the Payout page to start redeeming your VEs."
                : `You currently have no ${statusFilter} withdrawal requests. Try selecting another filter.`}
            </p>
            {statusFilter !== 'all' && (
              <button className="btn-secondary" style={{ marginTop: '18px' }} onClick={() => handleFilterChange('all')}>
                Show All Requests
              </button>
            )}
            <button
              onClick={() => onNavigate('/payout')}
              className="btn-primary"
              style={{ marginTop: '18px', fontSize: '0.9rem' }}
            >
              Redeem Rewards Now
            </button>
          </div>
        ) : (
          <>
            {/* Counter bar */}
            {data.total > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Showing <strong style={{ color: '#f8fafc' }}>{data.items.length}</strong> of <strong style={{ color: '#f8fafc' }}>{data.total}</strong> requests
                </span>
                {statusFilter === 'all' && (
                  <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                    Page {data.page} of {data.totalPages}
                  </span>
                )}
              </div>
            )}

            {data.items.map((w) => (
              <WithdrawalCard key={w.id} w={w} onCancel={handleCancel} cancelling={cancelling} />
            ))}

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  id="withdrawals-prev-page"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page <= 1 || loading}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                >
                  <ChevronLeft style={{ width: '15px', height: '15px' }} /> Prev
                </button>
                <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 800 }}>
                  {data.page} / {data.totalPages}
                </span>
                <button
                  id="withdrawals-next-page"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={data.page >= data.totalPages || loading}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                >
                  Next <ChevronRight style={{ width: '15px', height: '15px' }} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Notice */}
      <div className="info-box" style={{ marginTop: '18px' }}>
        <CheckCircle2 style={{ width: '18px', height: '18px', color: '#22d3ee', flexShrink: 0 }} />
        <span>
          Standard processing time is within <strong style={{ color: '#f8fafc' }}>24 hours</strong>, and up to <strong style={{ color: '#f8fafc' }}>72 hours</strong> for reviewed cases.
          Only <strong style={{ color: '#f8fafc' }}>pending</strong> withdrawals can be cancelled for immediate VEs refund.
        </span>
      </div>

    </div>
  );
};
