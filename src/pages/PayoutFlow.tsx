import React, { useEffect, useState } from 'react';
import {
  Smartphone, ShoppingBag, Play, ArrowLeft, CheckCircle2, AlertTriangle,
  Zap, ChevronRight, RefreshCw, Info, Lock, X, Star,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import type {
  UserWallet, PayoutMethod, PayoutDenomination, PayoutMethodId, PayoutResponse,
} from '../types/rewards';

interface PayoutFlowProps {
  onNavigate: (path: string) => void;
  onPayoutCompleted: () => void;
}

// ─── Confetti Component ──────────────────────────────────────────────────────
const Confetti: React.FC = () => {
  const pieces = Array.from({ length: 18 });
  const colors = ['#10B981', '#34D399', '#8B5CF6', '#F59E0B', '#06B6D4', '#F43F5E'];
  return (
    <>
      {pieces.map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i / pieces.length) * 100}%`,
            top: '-10px',
            background: colors[i % colors.length],
            animationDuration: `${1.8 + Math.random() * 1.2}s`,
            animationDelay: `${Math.random() * 0.6}s`,
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </>
  );
};

export const PayoutFlow: React.FC<PayoutFlowProps> = ({ onNavigate, onPayoutCompleted }) => {
  const [step, setStep] = useState(1);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [denominations, setDenominations] = useState<PayoutDenomination[]>([]);

  const [selectedMethodId, setSelectedMethodId] = useState<PayoutMethodId | null>(null);
  const [selectedDenom, setSelectedDenom] = useState<PayoutDenomination | null>(null);
  const [recipientDetail, setRecipientDetail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [payoutResult, setPayoutResult] = useState<PayoutResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPayoutData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [walletRes, methodsRes, denomsRes] = await Promise.all([
        apiClient.getWallet(),
        apiClient.getPayoutMethods(),
        apiClient.getDenominations(),
      ]);
      setWallet(walletRes);
      setMethods(methodsRes);
      setDenominations(denomsRes);
      const activeFirst = methodsRes.find((m) => m.status === 'active');
      if (activeFirst) setSelectedMethodId(activeFirst.id);
    } catch (err: any) {
      setApiError(err.message || 'Failed to load payout data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayoutData(); }, []);

  const selectedMethod = methods.find((m) => m.id === selectedMethodId);
  const availableDenoms = denominations.filter((d) => d.methodId === selectedMethodId);

  const renderMethodIcon = (iconName: string, size = 22) => {
    const style = { width: `${size}px`, height: `${size}px` };
    switch (iconName) {
      case 'Smartphone':  return <Smartphone style={style} />;
      case 'ShoppingBag': return <ShoppingBag style={style} />;
      case 'Play':        return <Play style={style} />;
      default:            return <Smartphone style={style} />;
    }
  };

  const validateForm = (): boolean => {
    setFieldError(null);
    if (!recipientDetail.trim()) {
      setFieldError(`Please enter your ${selectedMethod?.requiredFieldLabel || 'details'}.`);
      return false;
    }
    if (selectedMethodId === 'upi') {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(recipientDetail.trim())) {
        setFieldError('Invalid UPI ID format. Example: name@okhdfcbank or 9876543210@paytm');
        return false;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientDetail.trim())) {
        setFieldError('Invalid email format. Example: user@example.com');
        return false;
      }
    }
    return true;
  };

  const handleNextToStep3 = (denom: PayoutDenomination) => {
    if (!wallet || wallet.balances.VEs < denom.requiredVEs) {
      setApiError(`Insufficient VEs! You need ${denom.requiredVEs.toLocaleString()} VEs but only have ${wallet?.balances.VEs.toLocaleString() ?? 0}.`);
      return;
    }
    setSelectedDenom(denom);
    setApiError(null);
    setStep(3);
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!selectedMethodId || !selectedDenom || !recipientDetail) return;
    setIsSubmitting(true);
    setApiError(null);
    try {
      const result = await apiClient.submitPayout({
        methodId: selectedMethodId,
        denominationId: selectedDenom.id,
        payoutAmount: selectedDenom.payoutAmount,
        requiredVEs: selectedDenom.requiredVEs,
        recipientDetail: recipientDetail.trim(),
        recipientName: recipientName.trim() || undefined,
      });
      setPayoutResult(result);
      setShowConfirmModal(false);
      onPayoutCompleted();
    } catch (err: any) {
      setApiError(err.message || 'Payout request failed.');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="app-container page-enter" style={{ maxWidth: '720px' }}>
        <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '200px', height: '28px', margin: '0 auto 24px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '74px', borderRadius: '16px' }} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── SUCCESS SCREEN ──
  if (payoutResult) {
    return (
      <div className="app-container page-enter" style={{ maxWidth: '620px', position: 'relative' }}>
        <Confetti />
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>

          <div style={{
            width: '76px', height: '76px', borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.14)',
            border: '2px solid #10B981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: '#10B981',
            boxShadow: '0 0 30px rgba(16,185,129,0.25)',
          }}>
            <CheckCircle2 style={{ width: '42px', height: '42px' }} />
          </div>

          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f0f6ff', marginBottom: '8px' }}>
            Withdrawal Submitted!
          </h2>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '4px 14px', borderRadius: '20px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#FBBF24', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
            Status: Pending Review
          </div>

          <p style={{ color: '#64748B', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.7 }}>
            Your redemption request of{' '}
            <strong style={{ color: '#FFF' }}>₹{payoutResult.payoutAmount}</strong>{' '}
            via <strong style={{ color: '#FFF' }}>{selectedMethod?.title}</strong> has been received and is under review.
          </p>

          <div style={{
            background: 'rgba(10, 15, 30, 0.7)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '20px', textAlign: 'left', marginBottom: '28px',
          }}>
            {[
              { label: 'Transaction ID', value: `#${payoutResult.transactionId}`, mono: true },
              { label: 'Recipient', value: recipientDetail, mono: true },
              { label: 'VEs Deducted', value: `-${payoutResult.requiredVEs.toLocaleString()} VEs`, color: '#F87171' },
            ].map(({ label, value, mono, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                <span style={{ color: '#4e6072' }}>{label}:</span>
                <span style={{ fontFamily: mono ? 'var(--font-mono)' : undefined, fontWeight: 700, color: color || '#f0f6ff', fontSize: mono ? '0.78rem' : undefined }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '0.88rem' }}>
              <span style={{ color: '#4e6072' }}>Updated VEs Balance:</span>
              <span style={{ fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-mono)' }}>{payoutResult.newVeBalance.toLocaleString()} VEs</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button id="success-to-wallet-btn" onClick={() => onNavigate('/wallet')} className="btn-primary" style={{ padding: '13px 26px' }}>
              Back to Wallet
            </button>
            <button id="success-view-history-btn" onClick={() => onNavigate('/withdrawals')} className="btn-secondary">
              View History
            </button>
            <button id="success-new-payout-btn" onClick={() => { setPayoutResult(null); setStep(1); setSelectedDenom(null); setRecipientDetail(''); }} className="btn-secondary">
              New Payout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container page-enter" style={{ maxWidth: '800px' }}>

      {/* ── Top row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          onClick={() => { if (step > 1) setStep(step - 1); else onNavigate('/wallet'); }}
          className="btn-secondary"
          style={{ fontSize: '0.84rem', padding: '9px 15px' }}
        >
          <ArrowLeft style={{ width: '15px', height: '15px' }} />
          {step > 1 ? 'Back' : 'Back to Wallet'}
        </button>

        {wallet && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#64748B' }}>
            <span>Available:</span>
            <div className="ves-chip" style={{ fontSize: '0.84rem', padding: '5px 12px 5px 9px' }}>
              <Zap style={{ width: '13px', height: '13px', fill: '#10B981', color: '#10B981' }} />
              <span>{wallet.balances.VEs.toLocaleString()}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>VEs</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Error banner ── */}
      {apiError && (
        <div className="error-banner" style={{ marginBottom: '20px' }}>
          <div className="error-banner-content">
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#F43F5E', flexShrink: 0 }} />
            <p>{apiError}</p>
          </div>
          <button onClick={() => setApiError(null)} style={{ background: 'none', border: 'none', color: '#F43F5E', cursor: 'pointer', padding: '4px' }}>
            <X style={{ width: '17px', height: '17px' }} />
          </button>
        </div>
      )}

      {/* ── 4-Step Stepper ── */}
      <div className="stepper-container" style={{ marginBottom: '28px' }}>
        <div className="stepper-line" />
        <div className="stepper-progress" style={{ width: step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%' }} />
        {[
          { n: 1, label: 'Method' },
          { n: 2, label: 'Amount' },
          { n: 3, label: 'Details' },
          { n: 4, label: 'Confirm' },
        ].map(({ n, label }) => (
          <div key={n} className={`step-item${step >= n ? ' active' : ''}${step > n ? ' completed' : ''}`}>
            <div className="step-circle">{step > n ? '✓' : n}</div>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ─────────────────── STEP 1: METHOD ─────────────────── */}
      {step === 1 && (
        <div className="glass-card page-enter" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f0f6ff', marginBottom: '6px' }}>Choose Redemption Method</h2>
          <p style={{ color: '#4e6072', fontSize: '0.87rem', marginBottom: '24px' }}>Select how you'd like to receive your payout.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {methods.map((m) => {
              const isActive = m.status === 'active';
              const isSelected = selectedMethodId === m.id;
              return (
                <div
                  key={m.id}
                  id={`method-card-${m.id}`}
                  onClick={() => { if (isActive) { setSelectedMethodId(m.id); setStep(2); } }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 20px', borderRadius: '16px',
                    background: isSelected ? 'rgba(16, 185, 129, 0.07)' : 'rgba(10, 16, 30, 0.55)',
                    border: `1.5px solid ${isSelected ? '#10B981' : isActive ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'}`,
                    cursor: isActive ? 'pointer' : 'not-allowed',
                    opacity: isActive ? 1 : 0.55,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '13px',
                      background: isActive ? 'rgba(16, 185, 129, 0.13)' : 'rgba(148, 163, 184, 0.08)',
                      color: isActive ? '#10B981' : '#4e6072',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255,255,255,0.04)',
                    }}>
                      {renderMethodIcon(m.iconName, 23)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.02rem', color: '#f0f6ff' }}>{m.title}</span>
                        <span className={`badge badge-${m.status}`} style={{ fontSize: '0.62rem' }}>{m.status}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#4e6072' }}>{m.subtitle}</div>
                      {!isActive && m.statusReason && (
                        <div style={{ fontSize: '0.75rem', color: '#F43F5E', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Lock style={{ width: '11px', height: '11px' }} /> {m.statusReason}
                        </div>
                      )}
                    </div>
                  </div>
                  {isActive && <ChevronRight style={{ width: '20px', height: '20px', color: '#4e6072' }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────── STEP 2: AMOUNT ─────────────────── */}
      {step === 2 && selectedMethod && (
        <div className="glass-card page-enter" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px', marginBottom: '22px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.25)' }}>
              {renderMethodIcon(selectedMethod.iconName, 20)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0f6ff' }}>Select {selectedMethod.title} Denomination</h2>
              <div style={{ fontSize: '0.78rem', color: '#4e6072' }}>Required VEs are deducted at submission • Min. ₹10 withdrawal</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '14px' }}>
            {availableDenoms.map((d) => {
              const canAfford = wallet ? wallet.balances.VEs >= d.requiredVEs : false;
              const usageRatio = wallet ? Math.min((d.requiredVEs / wallet.balances.VEs) * 100, 100) : 0;
              const missingVEs = wallet ? Math.max(0, d.requiredVEs - wallet.balances.VEs) : 0;

              return (
                <div
                  key={d.id}
                  id={`denom-card-${d.id}`}
                  className={`denom-card${canAfford ? '' : ' denom-card-disabled'}`}
                  onClick={() => canAfford && handleNextToStep3(d)}
                >
                  {d.popular && (
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: '#FFF', fontSize: '0.62rem', fontWeight: 800,
                      padding: '2px 8px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', gap: '3px',
                    }}>
                      <Star style={{ width: '9px', height: '9px', fill: '#FFF' }} /> POPULAR
                    </div>
                  )}

                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f0f6ff', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                    ₹{d.payoutAmount}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.84rem', color: canAfford ? '#34D399' : '#F87171', fontWeight: 700, marginBottom: '10px' }}>
                    <Zap style={{ width: '13px', height: '13px', fill: canAfford ? '#10B981' : '#F87171' }} />
                    {d.requiredVEs.toLocaleString()} VEs required
                  </div>

                  {/* Usage progress bar */}
                  {canAfford && wallet && (
                    <div className="denom-progress">
                      <div
                        className="denom-progress-fill"
                        style={{
                          width: `${usageRatio}%`,
                          background: usageRatio > 70 ? '#F59E0B' : '#10B981',
                        }}
                      />
                    </div>
                  )}

                  {!canAfford && (
                    <div style={{ fontSize: '0.72rem', color: '#F43F5E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                      <AlertTriangle style={{ width: '11px', height: '11px' }} />
                      Need {missingVEs.toLocaleString()} more VEs
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────── STEP 3: DETAILS ─────────────────── */}
      {step === 3 && selectedMethod && selectedDenom && (
        <form onSubmit={handleProceedToConfirm} className="glass-card page-enter" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0f6ff', marginBottom: '6px' }}>
            Enter {selectedMethod.title} Details
          </h2>
          <p style={{ color: '#4e6072', fontSize: '0.85rem', marginBottom: '22px' }}>
            Payout: <strong style={{ color: '#34D399' }}>₹{selectedDenom.payoutAmount}</strong>
            {' '}•{' '}
            Deducts: <strong style={{ color: '#F87171', fontFamily: 'var(--font-mono)' }}>{selectedDenom.requiredVEs.toLocaleString()} VEs</strong>
          </p>

          <div className="input-group">
            <label className="input-label">{selectedMethod.requiredFieldLabel} *</label>
            <input
              id="payout-recipient-input"
              type={selectedMethod.fieldType}
              value={recipientDetail}
              onChange={(e) => { setRecipientDetail(e.target.value); if (fieldError) setFieldError(null); }}
              placeholder={selectedMethod.placeholder}
              className={`input-field${fieldError ? ' input-error' : ''}`}
              autoComplete="off"
              spellCheck={false}
            />
            {fieldError && <span className="input-error-msg">⚠ {fieldError}</span>}
          </div>

          {selectedMethodId === 'upi' && (
            <div className="input-group">
              <label className="input-label">Account Holder Name (Optional)</label>
              <input
                id="payout-name-input"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Alex Smith"
                className="input-field"
              />
            </div>
          )}

          <div className="info-box" style={{ marginBottom: '24px' }}>
            <Info style={{ width: '15px', height: '15px', color: '#06B6D4', flexShrink: 0 }} />
            <span>{selectedMethod.instructions}</span>
          </div>

          <button type="submit" id="payout-review-btn" className="btn-primary" style={{ width: '100%', fontSize: '1rem' }}>
            Review Withdrawal Details
            <ChevronRight style={{ width: '18px', height: '18px' }} />
          </button>
        </form>
      )}

      {/* ─────────────────── STEP 4: CONFIRM MODAL ─────────────────── */}
      {showConfirmModal && selectedDenom && selectedMethod && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f0f6ff' }}>Confirm Withdrawal</h3>
              <button onClick={() => setShowConfirmModal(false)} style={{ background: 'none', border: 'none', color: '#4e6072', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ background: 'rgba(7, 12, 24, 0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '22px', marginBottom: '22px' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.78rem', color: '#4e6072', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Payout Amount</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedDenom.payoutAmount}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#F87171', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '5px' }}>
                  <Zap style={{ width: '13px', height: '13px', fill: '#F87171' }} />
                  Deducts {selectedDenom.requiredVEs.toLocaleString()} VEs
                </div>
              </div>

              {[
                { label: 'Method', value: selectedMethod.title },
                { label: 'Recipient', value: recipientDetail, mono: true },
                { label: 'Est. Processing', value: '24h normal, up to 72h review' },
              ].map(({ label, value, mono }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                  <span style={{ color: '#4e6072' }}>{label}:</span>
                  <strong style={{ color: '#f0f6ff', fontFamily: mono ? 'var(--font-mono)' : undefined, fontSize: mono ? '0.78rem' : undefined }}>{value}</strong>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.78rem', color: '#4e6072', marginBottom: '18px', textAlign: 'center' }}>
              ⚠ The backend will validate all values. This action cannot be undone once processed.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button id="confirm-cancel-btn" onClick={() => setShowConfirmModal(false)} className="btn-secondary" style={{ flex: 1 }} disabled={isSubmitting}>
                Cancel
              </button>
              <button id="confirm-submit-btn" onClick={handleFinalSubmit} className="btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting
                  ? <><RefreshCw style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> Processing...</>
                  : 'Confirm & Redeem'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
