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

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<WithdrawalStatus, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: '#FBBF24', bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.3)',   Icon: Clock },
  processing: { label: 'Processing', color: '#22D3EE', bg: 'rgba(6,182,212,0.12)',    border: 'rgba(6,182,212,0.3)',    Icon: RefreshCw },
  approved:   { label: 'Approved',   color: '#34D399', bg: 'rgba(16,185,129,0.12)',   border: 'rgba(16,185,129,0.3)',   Icon: CheckCircle2 },
  rejected:   { label: 'Rejected',   color: '#F87171', bg: 'rgba(244,63,94,0.12)',    border: 'rgba(244,63,94,0.3)',    Icon: XCircle },
  cancelled:  { label: 'Cancelled',  color: '#94A3B8', bg: 'rgba(148,163,184,0.08)',  border: 'rgba(148,163,184,0.2)', Icon: Ban },
};

const METHOD_ICONS: Record<string, React.ElementType> = {
  upi: Smartphone,
  amazon_gift: ShoppingBag,
  google_play: Play,
};

const METHOD_COLORS: Record<string, string> = {
  upi: '#10B981',
  amazon_gift: '#F59E0B',
  google_play: '#8B5CF6',
};

// ─── Withdrawal Item ─────────────────────────────────────────────────────────
const WithdrawalCard: React.FC<{
  w: Withdrawal;
  onCancel: (id: string) => void;
  cancelling: string | null;
}> = ({ w, onCancel, cancelling }) => {
  const sc = STATUS_CONFIG[w.status] ?? STATUS_CONFIG.pending;
  const MethodIcon = METHOD_ICONS[w.method] ?? Smartphone;
  const methodColor = METHOD_COLORS[w.method] ?? '#10B981';
  const isCancelling = cancelling === w.id;

  return (
    <div
      className="withdrawal-item"
      style={{ padding: '18px', borderRadius: '14px', background: 'rgba(13, 20, 36, 0.5)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px', transition: 'border-color 0.2s ease' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Method icon */}
        <div style={{
          width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
          background: `rgba(${methodColor === '#10B981' ? '16,185,129' : methodColor === '#F59E0B' ? '245,158,11' : '139,92,246'}, 0.13)`,
          border: `1px solid ${methodColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: methodColor,
        }}>
          <MethodIcon style={{ width: '22px', height: '22px' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '5px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f6ff' }}>{w.methodLabel}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Payout amount */}
              <span className="tabular-num" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f0f6ff' }}>
                {w.currencySymbol}{w.payoutAmount}
              </span>
              {/* Status badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', borderRadius: '20px',
                fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
              }}>
                {w.status === 'pending' && <span className="pulse-dot" style={{ width: '5px', height: '5px' }} />}
                {w.status === 'processing' && <RefreshCw style={{ width: '10px', height: '10px', animation: 'spin 1s linear infinite' }} />}
                {sc.label}
              </span>
            </div>
          </div>

          {/* Meta row */}
          <div style={{ fontSize: '0.78rem', color: '#4e6072', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span>To: <strong style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{w.recipientDetail}</strong></span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap style={{ width: '11px', height: '11px', color: '#F87171' }} />
              <span style={{ color: '#F87171', fontWeight: 700 }}>{w.requiredVEs.toLocaleString()} VEs</span>
            </span>
            {w.transactionId && (
              <>
                <span>•</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>#{w.transactionId}</span>
              </>
            )}
          </div>

          {/* Dates */}
          <div style={{ fontSize: '0.72rem', color: '#4e6072', marginTop: '5px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span>
              Requested:{' '}
              <span style={{ color: '#64748B' }}>
                {new Date(w.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </span>
            {w.processedAt && (
              <span>
                Processed:{' '}
                <span style={{ color: '#64748B' }}>
                  {new Date(w.processedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
            )}
          </div>

          {/* Rejection reason */}
          {w.status === 'rejected' && w.rejectionReason && (
            <div style={{
              marginTop: '10px', padding: '9px 13px', borderRadius: '9px',
              background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)',
              fontSize: '0.78rem', color: '#fca5a5', display: 'flex', gap: '8px',
            }}>
              <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '1px', color: '#f43f5e' }} />
              <span>{w.rejectionReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cancel button for pending items */}
      {w.status === 'pending' && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id={`cancel-withdrawal-${w.id}`}
            onClick={() => onCancel(w.id)}
            disabled={isCancelling}
            className="btn-danger"
            style={{ fontSize: '0.8rem' }}
          >
            {isCancelling
              ? <><RefreshCw style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> Cancelling...</>
              : <><X style={{ width: '13px', height: '13px' }} /> Cancel Request</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Withdrawals Page ───────────────────────────────────────────────────
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
  }, [statusFilter]);

  useEffect(() => {
    loadWithdrawals(page, statusFilter);
  }, [page, statusFilter]);

  const handleFilterChange = (f: StatusFilter) => {
    setStatusFilter(f);
    setPage(1);
    loadWithdrawals(1, f);
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this withdrawal? Your VEs will be restored.')) return;
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
    { key: 'all',        label: 'All' },
    { key: 'pending',    label: '⏳ Pending',    color: '#FBBF24' },
    { key: 'processing', label: '⚡ Processing',  color: '#22D3EE' },
    { key: 'approved',   label: '✓ Approved',    color: '#34D399' },
    { key: 'rejected',   label: '✕ Rejected',    color: '#F87171' },
    { key: 'cancelled',  label: '⊘ Cancelled',   color: '#94A3B8' },
  ];

  return (
    <div className="app-container page-enter" style={{ maxWidth: '860px' }}>

      {/* Toast */}
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

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => onNavigate('/wallet')}
            className="btn-secondary"
            style={{ padding: '9px 14px', fontSize: '0.83rem' }}
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />
            Wallet
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History style={{ width: '22px', height: '22px', color: '#8B5CF6' }} />
              Withdrawal History
            </h1>
            <p style={{ color: '#4e6072', fontSize: '0.82rem', marginTop: '2px' }}>
              Track all your payout requests and their statuses.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            id="withdrawals-refresh-btn"
            onClick={() => loadWithdrawals(page)}
            className="btn-secondary"
            style={{ fontSize: '0.83rem', padding: '9px 14px' }}
          >
            <RefreshCw style={{ width: '14px', height: '14px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            id="withdrawals-new-payout-btn"
            onClick={() => onNavigate('/payout')}
            className="btn-primary"
            style={{ fontSize: '0.88rem' }}
          >
            + New Payout
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="error-banner">
          <div className="error-banner-content">
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#F43F5E', flexShrink: 0 }} />
            <p>{error}</p>
          </div>
          <button onClick={() => loadWithdrawals(page)} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '7px 12px' }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Status Filter Tabs ── */}
      <div style={{ marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
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

      {/* ── List ── */}
      <div className="glass-card" style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '14px' }} />
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
                ? "You haven't made any withdrawal requests yet. Head to the Payout page to get started."
                : `You have no ${statusFilter} withdrawals. Try another filter or check back later.`}
            </p>
            {statusFilter !== 'all' && (
              <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={() => handleFilterChange('all')}>
                Show All
              </button>
            )}
            <button
              onClick={() => onNavigate('/payout')}
              className="btn-primary"
              style={{ marginTop: '16px', fontSize: '0.9rem' }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px', transform: 'rotate(180deg)' }} />
              Go to Payout Page
            </button>
          </div>
        ) : (
          <>
            {/* Summary counts bar */}
            {data.total > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#4e6072' }}>
                  Showing <strong style={{ color: '#94a3b8' }}>{data.items.length}</strong> of <strong style={{ color: '#94a3b8' }}>{data.total}</strong> requests
                </span>
                {statusFilter === 'all' && (
                  <span style={{ fontSize: '0.72rem', color: '#4e6072', marginLeft: 'auto' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  id="withdrawals-prev-page"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page <= 1 || loading}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.83rem' }}
                >
                  <ChevronLeft style={{ width: '15px', height: '15px' }} /> Prev
                </button>
                <span style={{ fontSize: '0.83rem', color: '#64748B', fontWeight: 700 }}>
                  {data.page} / {data.totalPages}
                </span>
                <button
                  id="withdrawals-next-page"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={data.page >= data.totalPages || loading}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.83rem' }}
                >
                  Next <ChevronRight style={{ width: '15px', height: '15px' }} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Info note ── */}
      <div className="info-box" style={{ marginTop: '16px' }}>
        <CheckCircle2 style={{ width: '16px', height: '16px', color: '#06B6D4', flexShrink: 0 }} />
        <span>
          Processing time is normally within <strong style={{ color: '#94a3b8' }}>24 hours</strong>, and up to <strong style={{ color: '#94a3b8' }}>72 hours</strong> for reviewed cases.
          Only <strong style={{ color: '#94a3b8' }}>pending</strong> withdrawals can be cancelled.
        </span>
      </div>

    </div>
  );
};
