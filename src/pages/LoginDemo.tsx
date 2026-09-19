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
    <div className="app-container page-enter login-page-container">
      <div className="glass-card login-card">

        {/* Top Back Navigation Button */}
        <div className="login-back-wrapper">
          <button
            id="login-back-btn"
            onClick={() => {
              if (!localStorage.getItem('veloop_access_token')) {
                localStorage.setItem('veloop_access_token', 'demo_access_token');
              }
              if (onNavigate) onNavigate('/wallet');
              else window.history.back();
            }}
            className="btn-secondary login-back-btn"
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />
            Back to Wallet
          </button>
        </div>

        {/* Branding Hero */}
        <div className="login-hero">
          <div className="login-logo-icon">
            <Zap style={{ color: '#fff', width: '28px', height: '28px' }} />
          </div>
          <h1 className="login-hero-title">
            VELoop <span style={{ color: '#059669' }}>Rewards</span>
          </h1>
          <p className="login-hero-sub">
            Backend-Driven Rewards &amp; Instant Payout Portal
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="login-demo-box">
          <div className="login-demo-box-header">
            <UserCheck style={{ width: '14px', height: '14px' }} />
            Quick Demo — Bypass Authentication
          </div>
          <div className="login-demo-buttons">
            <button
              id="demo-high-balance"
              onClick={() => {
                if (!localStorage.getItem('veloop_access_token')) {
                  localStorage.setItem('veloop_access_token', 'demo_access_token');
                }
                mockBackend.updateSettings({ userPreset: 'high' });
                onLoginSuccess('high');
              }}
              className="btn-primary login-demo-btn"
            >
              <Zap style={{ width: '14px', height: '14px', flexShrink: 0 }} />
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
              className="btn-secondary login-demo-btn"
            >
              Low Balance (180 VEs)
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="filter-tabs login-tabs">
          <button
            className={`filter-tab${activeTab === 'login' ? ' active' : ''}`}
            style={{ flex: 1, padding: '9px 10px' }}
            onClick={() => { setActiveTab('login'); setStatusMsg(null); }}
          >
            Login
          </button>
          <button
            className={`filter-tab${activeTab === 'signup' ? ' active' : ''}`}
            style={{ flex: 1, padding: '9px 10px' }}
            onClick={() => { setActiveTab('signup'); setStatusMsg(null); }}
          >
            Create Account
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div style={{
            padding: '10px 14px', borderRadius: '12px', marginBottom: '14px',
            fontSize: '0.84rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '8px',
            background: statusMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16,185,129,0.35)' : 'rgba(244,63,94,0.35)'}`,
            color: statusMsg.type === 'success' ? '#065f46' : '#9f1239',
            animation: 'slideDown 0.3s ease-out',
          }}>
            {statusMsg.type === 'success'
              ? <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              : <AlertTriangle style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
            {statusMsg.text}
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="input-group login-input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter registered email address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '44px' }}
                  required
                />
                <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b' }} />
              </div>
            </div>

            <div className="input-group login-input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-field"
                  style={{ paddingLeft: '44px' }}
                  required
                />
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b' }} />
              </div>
            </div>

            <button id="login-submit-btn" type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
              {isLoading ? 'Authenticating…' : 'Login'}
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '0.74rem', color: '#64748b', justifyContent: 'center' }}>
              <ShieldCheck style={{ width: '14px', height: '14px', color: '#059669' }} />
              JWT secured · Live backend validation enabled
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit}>
            <div className="login-signup-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <div className="input-group login-input-group">
                <label className="input-label">Title</label>
                <select value={signupData.title} onChange={(e) => setSignupData({ ...signupData, title: e.target.value as any })} className="input-field">
                  <option>Mr</option><option>Mrs</option><option>Miss</option><option>Master</option>
                </select>
              </div>
              <div className="input-group login-input-group">
                <label className="input-label">First Name</label>
                <input type="text" value={signupData.first_name} onChange={(e) => setSignupData({ ...signupData, first_name: e.target.value })} placeholder="e.g. John" className="input-field" required />
              </div>
            </div>

            <div className="login-signup-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group login-input-group">
                <label className="input-label">Middle Name</label>
                <input type="text" value={signupData.middle_name || ''} onChange={(e) => setSignupData({ ...signupData, middle_name: e.target.value })} placeholder="e.g. Alex" className="input-field" />
              </div>
              <div className="input-group login-input-group">
                <label className="input-label">Last Name</label>
                <input type="text" value={signupData.last_name} onChange={(e) => setSignupData({ ...signupData, last_name: e.target.value })} placeholder="e.g. Doe" className="input-field" required />
              </div>
            </div>

            <div className="input-group login-input-group">
              <label className="input-label">Email Address</label>
              <input id="signup-email" type="email" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} placeholder="e.g. john@example.com" className="input-field" required />
            </div>

            <div className="login-signup-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <div className="input-group login-input-group">
                <label className="input-label">Country Code</label>
                <input type="text" value={signupData.country_code || ''} onChange={(e) => setSignupData({ ...signupData, country_code: e.target.value })} placeholder="+91" className="input-field" />
              </div>
              <div className="input-group login-input-group">
                <label className="input-label">Phone Number</label>
                <input id="signup-phone" type="text" value={signupData.phone} onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })} placeholder="e.g. 9876543210" className="input-field" required />
              </div>
            </div>

            <div className="login-signup-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group login-input-group">
                <label className="input-label">Gender</label>
                <select value={signupData.gender} onChange={(e) => setSignupData({ ...signupData, gender: e.target.value as any })} className="input-field">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="input-group login-input-group">
                <label className="input-label">Date of Birth</label>
                <input type="date" value={signupData.date_of_birth} onChange={(e) => setSignupData({ ...signupData, date_of_birth: e.target.value })} className="input-field" />
              </div>
            </div>

            <div className="input-group login-input-group">
              <label className="input-label">Password</label>
              <input id="signup-password" type="password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} placeholder="Min. 8 characters" className="input-field" required />
            </div>

            <button id="signup-submit-btn" type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create Account'}
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
