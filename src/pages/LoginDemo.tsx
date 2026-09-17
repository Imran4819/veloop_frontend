import React, { useState } from 'react';
import { Zap, ArrowRight, UserCheck, Lock, Mail, AlertTriangle, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { mockBackend } from '../services/mockBackend';
import type { SignupPayload } from '../types/rewards';

interface LoginDemoProps {
  onLoginSuccess: (preset: 'high' | 'low') => void;
  onNavigate?: (path: string) => void;
}

export const LoginDemo: React.FC<LoginDemoProps> = ({ onLoginSuccess, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupData, setSignupData] = useState<SignupPayload>({
    title: 'Mr', first_name: '', middle_name: '', last_name: '',
    email: '', phone: '', password: '',
    gender: 'Male', date_of_birth: '', country_code: '+91', role: 'user',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await apiClient.login({ email: loginEmail, password: loginPassword });
      if (!res || res.success === false) throw new Error(res?.message || 'Invalid credentials.');
      setStatusMsg({ type: 'success', text: res.message || 'Login successful! Redirecting...' });
      setTimeout(() => { mockBackend.updateSettings({ userPreset: 'high' }); onLoginSuccess('high'); }, 700);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Login failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await apiClient.signup(signupData);
      if (!res || res.success === false) throw new Error(res?.message || 'Signup failed.');
      setStatusMsg({ type: 'success', text: res.message || 'Account created! Switching to login...' });
      setTimeout(() => { setLoginEmail(signupData.email); setActiveTab('login'); setStatusMsg(null); }, 1200);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Signup failed.' });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="app-container page-enter" style={{ maxWidth: '540px', paddingTop: '16px' }}>
      <div className="glass-card" style={{ padding: '38px' }}>

        {/* ── Back Button (inside card, top-left) ── */}
        <div style={{ marginBottom: '20px' }}>
          <button
            id="login-back-btn"
            onClick={() => {
              if (!localStorage.getItem('veloop_access_token')) {
                localStorage.setItem('veloop_access_token', 'demo_access_token');
              }
              if (onNavigate) onNavigate('/wallet');
              else window.history.back();
            }}
            className="btn-secondary"
            style={{ fontSize: '0.84rem', padding: '9px 16px' }}
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />
            Back to Wallet
          </button>
        </div>

        {/* ── Branding ── */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 10px 32px rgba(16, 185, 129, 0.45)',
          }}>
            <Zap style={{ color: '#fff', width: '34px', height: '34px' }} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f0f6ff', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            VELoop <span style={{ color: '#10B981' }}>Rewards</span>
          </h1>
          <p style={{ color: '#4e6072', fontSize: '0.85rem' }}>
            Backend-Driven Wallet &amp; Withdrawal Portal
          </p>
        </div>

        {/* ── Quick Demo Presets ── */}
        <div style={{ marginBottom: '24px', background: 'rgba(7, 12, 24, 0.7)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <UserCheck style={{ width: '13px', height: '13px' }} />
            Quick Demo — Bypass Auth
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              id="demo-high-balance"
              onClick={() => {
                if (!localStorage.getItem('veloop_access_token')) {
                  localStorage.setItem('veloop_access_token', 'demo_access_token');
                }
                mockBackend.updateSettings({ userPreset: 'high' });
                onLoginSuccess('high');
              }}
              className="btn-primary"
              style={{ flex: 1, padding: '10px 12px', fontSize: '0.8rem' }}
            >
              <Zap style={{ width: '14px', height: '14px' }} />
              High Balance (25k VEs)
            </button>
            <button
              id="demo-low-balance"
              onClick={() => {
                if (!localStorage.getItem('veloop_access_token')) {
                  localStorage.setItem('veloop_access_token', 'demo_access_token');
                }
                mockBackend.updateSettings({ userPreset: 'low' });
                onLoginSuccess('low');
              }}
              className="btn-secondary"
              style={{ flex: 1, padding: '10px 12px', fontSize: '0.8rem' }}
            >
              Low Balance (180 VEs)
            </button>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="filter-tabs" style={{ marginBottom: '22px', width: '100%' }}>
          <button
            className={`filter-tab${activeTab === 'login' ? ' active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setActiveTab('login'); setStatusMsg(null); }}
          >
            Login
          </button>
          <button
            className={`filter-tab${activeTab === 'signup' ? ' active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setActiveTab('signup'); setStatusMsg(null); }}
          >
            Sign Up
          </button>
        </div>

        {/* ── Status Message ── */}
        {statusMsg && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', marginBottom: '18px',
            fontSize: '0.86rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '9px',
            background: statusMsg.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
            border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
            color: statusMsg.type === 'success' ? '#34D399' : '#F87171',
            animation: 'slideDown 0.3s ease-out',
          }}>
            {statusMsg.type === 'success'
              ? <CheckCircle2 style={{ width: '17px', height: '17px' }} />
              : <AlertTriangle style={{ width: '17px', height: '17px' }} />}
            {statusMsg.text}
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '42px' }}
                  required
                />
                <Mail style={{ position: 'absolute', left: '13px', top: '14px', width: '17px', height: '17px', color: '#4e6072' }} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field"
                  style={{ paddingLeft: '42px' }}
                  required
                />
                <Lock style={{ position: 'absolute', left: '13px', top: '14px', width: '17px', height: '17px', color: '#4e6072' }} />
              </div>
            </div>

            <button id="login-submit-btn" type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
              {isLoading ? 'Authenticating…' : 'Login'}
              <ArrowRight style={{ width: '17px', height: '17px' }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '0.75rem', color: '#4e6072', justifyContent: 'center' }}>
              <ShieldCheck style={{ width: '12px', height: '12px', color: '#10B981' }} />
              JWT secured · Backend validates all credentials
            </div>
          </form>
        )}

        {/* ── SIGNUP FORM ── */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <select value={signupData.title} onChange={(e) => setSignupData({ ...signupData, title: e.target.value as any })} className="input-field">
                  <option>Mr</option><option>Mrs</option><option>Miss</option><option>Master</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">First Name</label>
                <input type="text" value={signupData.first_name} onChange={(e) => setSignupData({ ...signupData, first_name: e.target.value })} placeholder="e.g. John" className="input-field" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">Middle Name</label>
                <input type="text" value={signupData.middle_name || ''} onChange={(e) => setSignupData({ ...signupData, middle_name: e.target.value })} placeholder="e.g. Alexander" className="input-field" />
              </div>
              <div className="input-group">
                <label className="input-label">Last Name</label>
                <input type="text" value={signupData.last_name} onChange={(e) => setSignupData({ ...signupData, last_name: e.target.value })} placeholder="e.g. Doe" className="input-field" required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input id="signup-email" type="email" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} placeholder="e.g. john@example.com" className="input-field" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">Code</label>
                <input type="text" value={signupData.country_code || ''} onChange={(e) => setSignupData({ ...signupData, country_code: e.target.value })} placeholder="+91" className="input-field" />
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input id="signup-phone" type="text" value={signupData.phone} onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })} placeholder="e.g. 9876543210" className="input-field" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">Gender</label>
                <select value={signupData.gender} onChange={(e) => setSignupData({ ...signupData, gender: e.target.value as any })} className="input-field">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Date of Birth</label>
                <input type="date" value={signupData.date_of_birth} onChange={(e) => setSignupData({ ...signupData, date_of_birth: e.target.value })} className="input-field" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input id="signup-password" type="password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} placeholder="Min. 8 characters" className="input-field" required />
            </div>

            <button id="signup-submit-btn" type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create Account'}
              <ArrowRight style={{ width: '17px', height: '17px' }} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
