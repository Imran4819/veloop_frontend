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

// ─── Confetti Animation ─────────────────────────────────────────────────────
const Confetti: React.FC = () => {
  const pieces = Array.from({ length: 24 });
  const colors = ['#059669', '#10B981', '#7C3AED', '#D97706', '#0891B2', '#E11D48'];
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
            animationDuration: `${1.8 + Math.random() * 1.4}s`,
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
    if (!localStorage.getItem('veloop_access_token')) {
      onNavigate('/login');
      return;
    }
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
      setApiError(`Insufficient VEs! You need ${denom.requiredVEs.toLocaleString()} VEs but currently have ${wallet?.balances.VEs.toLocaleString() ?? 0}.`);
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
    if (!localStorage.getItem('veloop_access_token')) {
      setShowConfirmModal(false);
      onNavigate('/login');
      return;
    }
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

  // Loading View
  if (loading) {
    return (
      <div className="app-container page-enter" style={{ maxWidth: '720px' }}>
        <div className="glass-card" style={{ padding: '38px', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '220px', height: '28px', margin: '0 auto 24px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '78px', borderRadius: '18px' }} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── SUCCESS SCREEN ──
  if (payoutResult) {
    return (
      <div className="app-container page-enter" style={{ maxWidth: '640px', position: 'relative' }}>
        <Confetti />
        <div className="glass-card" style={{ padding: '42px', textAlign: 'center' }}>

          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.14)',
            border: '2px solid #059669',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 22px', color: '#059669',
            boxShadow: '0 4px 20px rgba(5,150,105,0.2)',
          }}>
            <CheckCircle2 style={{ width: '46px', height: '46px' }} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
            Withdrawal Request Submitted!
          </h2>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 16px', borderRadius: '30px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#b45309', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '22px' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
            Status: Pending Review
          </div>

          <p style={{ color: '#475569', fontSize: '0.94rem', marginBottom: '28px', lineHeight: 1.7 }}>
            Your redemption of{' '}
            <strong style={{ color: '#0f172a' }}>₹{payoutResult.payoutAmount}</strong>{' '}
            via <strong style={{ color: '#0f172a' }}>{selectedMethod?.title}</strong> has been logged into the queue.
          </p>

          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '18px', padding: '22px', textAlign: 'left', marginBottom: '30px',
          }}>
            {[
              { label: 'Transaction Reference', value: `#${payoutResult.transactionId}`, mono: true },
              { label: 'Recipient Address', value: recipientDetail, mono: true },
              { label: 'VEs Deducted', value: `-${payoutResult.requiredVEs.toLocaleString()} VEs`, color: '#e11d48' },
            ].map(({ label, value, mono, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>{label}:</span>
                <span style={{ fontFamily: mono ? 'var(--font-mono)' : undefined, fontWeight: 800, color: color || '#0f172a', fontSize: mono ? '0.8rem' : undefined }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Remaining VEs Balance:</span>
              <span style={{ fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>{payoutResult.newVeBalance.toLocaleString()} VEs</span>
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
    <div className="app-container page-enter" style={{ maxWidth: '820px' }}>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => { if (step > 1) setStep(step - 1); else onNavigate('/wallet'); }}
          className="btn-secondary"
          style={{ fontSize: '0.85rem', padding: '9px 16px' }}
        >
          <ArrowLeft style={{ width: '15px', height: '15px' }} />
          {step > 1 ? 'Back' : 'Back to Wallet'}
        </button>

        {wallet && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#475569' }}>
            <span>Available:</span>
            <div className="ves-chip" style={{ fontSize: '0.85rem', padding: '5px 12px 5px 9px' }}>
              <Zap style={{ width: '14px', height: '14px', fill: '#059669', color: '#059669' }} />
              <span>{wallet.balances.VEs.toLocaleString()}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>VEs</span>
            </div>
          </div>
        )}
      </div>

      {/* Error banner */}
      {apiError && (
        <div className="error-banner" style={{ marginBottom: '22px' }}>
          <div className="error-banner-content">
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#e11d48', flexShrink: 0 }} />
            <p>{apiError}</p>
          </div>
          <button onClick={() => setApiError(null)} style={{ background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', padding: '4px' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      )}

      {/* 4-Step Stepper Bar */}
      <div className="stepper-container" style={{ marginBottom: '30px' }}>
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
        <div className="glass-card page-enter" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>Choose Redemption Method</h2>
          <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '26px' }}>Select how you would like to receive your payout funds.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    padding: '20px 22px', borderRadius: '18px',
                    background: isSelected ? 'rgba(236, 253, 245, 0.85)' : '#ffffff',
                    border: `1.5px solid ${isSelected ? '#059669' : isActive ? 'rgba(226,232,240,0.9)' : 'rgba(226,232,240,0.5)'}`,
                    cursor: isActive ? 'pointer' : 'not-allowed',
                    opacity: isActive ? 1 : 0.55,
                    transition: 'all 0.22s ease',
                    boxShadow: isSelected ? '0 8px 24px rgba(5,150,105,0.14)' : '0 2px 8px rgba(15,23,42,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '14px',
                      background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(241, 245, 249, 0.9)',
                      color: isActive ? '#059669' : '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(226,232,240,0.9)',
                    }}>
                      {renderMethodIcon(m.iconName, 24)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{m.title}</span>
                        <span className={`badge badge-${m.status}`} style={{ fontSize: '0.64rem' }}>{m.status}</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#475569' }}>{m.subtitle}</div>
                      {!isActive && m.statusReason && (
                        <div style={{ fontSize: '0.76rem', color: '#e11d48', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                          <Lock style={{ width: '12px', height: '12px' }} /> {m.statusReason}
                        </div>
                      )}
                    </div>
                  </div>
                  {isActive && <ChevronRight style={{ width: '22px', height: '22px', color: '#64748b' }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────── STEP 2: AMOUNT ─────────────────── */}
      {step === 2 && selectedMethod && (
        <div className="glass-card page-enter" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
              {renderMethodIcon(selectedMethod.iconName, 22)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>Select {selectedMethod.title} Denomination</h2>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>VEs will be deducted upon confirmation • Minimum payout ₹10</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: '14px' }}>
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
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      color: '#FFF', fontSize: '0.6rem', fontWeight: 900,
                      padding: '2px 8px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', gap: '3px',
                      boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
                    }}>
                      <Star style={{ width: '9px', height: '9px', fill: '#FFF' }} /> POPULAR
                    </div>
                  )}

                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                    ₹{d.payoutAmount}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: canAfford ? '#047857' : '#be123c', fontWeight: 900, marginBottom: '10px' }}>
                    <Zap style={{ width: '14px', height: '14px', fill: canAfford ? '#059669' : '#be123c' }} />
                    {d.requiredVEs.toLocaleString()} VEs
                  </div>

                  {canAfford && wallet && (
                    <div className="denom-progress">
                      <div
                        className="denom-progress-fill"
                        style={{
                          width: `${usageRatio}%`,
                          background: usageRatio > 70 ? '#d97706' : '#059669',
                        }}
                      />
                    </div>
                  )}

                  {!canAfford && (
                    <div style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                      <AlertTriangle style={{ width: '12px', height: '12px' }} />
                      Need {missingVEs.toLocaleString()} more
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
        <form onSubmit={handleProceedToConfirm} className="glass-card page-enter" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
            Enter {selectedMethod.title} Details
          </h2>
          <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '24px' }}>
            Redemption value: <strong style={{ color: '#047857' }}>₹{selectedDenom.payoutAmount}</strong>
            {' '}•{' '}
            Deducts: <strong style={{ color: '#e11d48', fontFamily: 'var(--font-mono)' }}>{selectedDenom.requiredVEs.toLocaleString()} VEs</strong>
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

          <div className="info-box" style={{ marginBottom: '26px' }}>
            <Info style={{ width: '16px', height: '16px', color: '#0891b2', flexShrink: 0 }} />
            <span>{selectedMethod.instructions}</span>
          </div>

          <button type="submit" id="payout-review-btn" className="btn-primary" style={{ width: '100%', fontSize: '1rem' }}>
            Review &amp; Confirm Withdrawal
            <ChevronRight style={{ width: '18px', height: '18px' }} />
          </button>
        </form>
      )}

      {/* ─────────────────── STEP 4: CONFIRM MODAL ─────────────────── */}
      {showConfirmModal && selectedDenom && selectedMethod && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>Confirm Payout Request</h3>
              <button onClick={() => setShowConfirmModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', marginBottom: '22px' }}>
              <div style={{ textAlign: 'center', marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 800 }}>Total Payout Amount</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedDenom.payoutAmount}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#e11d48', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
                  <Zap style={{ width: '14px', height: '14px', fill: '#e11d48' }} />
                  Deducts {selectedDenom.requiredVEs.toLocaleString()} VEs
                </div>
              </div>

              {[
                { label: 'Method', value: selectedMethod.title },
                { label: 'Recipient Detail', value: recipientDetail, mono: true },
                { label: 'Est. Processing', value: 'Instant - 24h normal review' },
              ].map(({ label, value, mono }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                  <span style={{ color: '#64748b' }}>{label}:</span>
                  <strong style={{ color: '#0f172a', fontFamily: mono ? 'var(--font-mono)' : undefined, fontSize: mono ? '0.8rem' : undefined }}>{value}</strong>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>
              ⚠ The backend will validate balance and details. Action cannot be undone.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button id="confirm-cancel-btn" onClick={() => setShowConfirmModal(false)} className="btn-secondary" style={{ flex: 1 }} disabled={isSubmitting}>
                Cancel
              </button>
              <button id="confirm-submit-btn" onClick={handleFinalSubmit} className="btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting
                  ? <><RefreshCw style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> Submitting...</>
                  : 'Confirm & Redeem'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
