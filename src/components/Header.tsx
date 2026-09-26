import React, { useState } from 'react';
import { Zap, Wallet, ArrowUpRight, LogOut, LogIn, ShieldCheck, History, Menu, X } from 'lucide-react';
import type { UserWallet } from '../types/rewards';
import { getApiStatus } from '../services/apiClient';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  wallet: UserWallet | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, wallet, onLogout }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const apiStatus = getApiStatus();
  const isLoggedIn = Boolean(localStorage.getItem('veloop_access_token'));

  const navLinks = [
    { path: '/wallet',      label: 'Dashboard',     Icon: Wallet,      activeColor: '#34d399' },
    { path: '/payout',      label: 'Payout / Redeem', Icon: ArrowUpRight, activeColor: '#34d399' },
    { path: '/withdrawals', label: 'Withdrawals',   Icon: History,     activeColor: '#c084fc' },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileNavOpen(false);
  };

  return (
    <header className="header-bar">
      <div className="header-container">
        {/* Logo */}
        <div
          onClick={() => handleNav('/wallet')}
          className="header-logo-group"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)', flexShrink: 0,
            position: 'relative', overflow: 'hidden',
          }}>
            <Zap style={{ color: '#fff', width: '20px', height: '20px', zIndex: 1 }} />
          </div>
          <div className="header-logo-text">
            <div style={{
              fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.5px',
              fontFamily: 'var(--font-display)',
              color: '#f8fafc',
              whiteSpace: 'nowrap', lineHeight: 1.1,
            }}>
              VELoop <span style={{ color: '#34d399' }}>Rewards</span>
            </div>
            <div className="header-logo-sub" style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.9px', textTransform: 'uppercase', marginTop: '2px' }}>
              WALLET &amp; PAYOUTS
            </div>
          </div>
        </div>

        {/* Desktop Nav Pills */}
        <nav className="desktop-nav">
          {navLinks.map(({ path, label, Icon, activeColor }) => {
            const isActive = currentPath === path;
            return (
              <button
                key={path}
                id={`nav-${path.slice(1)}`}
                onClick={() => handleNav(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 18px', borderRadius: '10px',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                  fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(30, 41, 59, 0.9)' : 'transparent',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  boxShadow: isActive ? '0 2px 10px rgba(0, 0, 0, 0.3)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                <Icon style={{ width: '16px', height: '16px', color: isActive ? activeColor : 'inherit' }} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* API Status Dot */}
          {apiStatus !== 'unknown' && (
            <div
              className="desktop-api-status"
              title={apiStatus === 'live' ? 'Connected to live backend' : 'Demo mode (backend offline)'}
            >
              <span className={`status-dot ${apiStatus === 'live' ? 'status-dot-live' : 'status-dot-mock'}`} />
              <span>{apiStatus === 'live' ? 'LIVE' : 'DEMO'}</span>
            </div>
          )}

          {/* VEs Balance Chip */}
          {isLoggedIn && wallet && (
            <div
              className="ves-chip"
              id="header-ves-balance"
              style={{ cursor: 'pointer' }}
              onClick={() => handleNav('/wallet')}
              title="Click to view wallet"
            >
              <Zap style={{ width: '15px', height: '15px', fill: '#34d399', color: '#34d399', flexShrink: 0 }} />
              <span className="tabular-num" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>{wallet.balances.VEs.toLocaleString()}</span>
              <span className="ves-chip-label" style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 800, color: '#34d399' }}>VEs</span>
            </div>
          )}

          {/* User Profile Controls */}
          {isLoggedIn && wallet ? (
            <>
              {/* Desktop User Pill */}
              <div className="desktop-user-pill">
                <img
                  src={wallet.avatarUrl}
                  alt={wallet.userName}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #10b981' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(wallet.userName)}&background=059669&color=fff`; }}
                />
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>{wallet.userName}</div>
                  <div style={{ fontSize: '0.64rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 800 }}>
                    <ShieldCheck style={{ width: '10px', height: '10px' }} />
                    {wallet.tier}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  id="header-logout-btn"
                  title="Switch Demo User / Logout"
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', marginLeft: '4px', borderRadius: '6px', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#fb7185')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#94a3b8')}
                >
                  <LogOut style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </>
          ) : (
            <button
              id="header-login-btn"
              onClick={() => handleNav('/login')}
              className="btn-primary"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.82rem', fontWeight: 800, padding: '8px 16px',
                borderRadius: '30px', flexShrink: 0
              }}
            >
              <LogIn style={{ width: '15px', height: '15px' }} />
              Login
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileNavOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu & Overlay */}
      {mobileNavOpen && (
        <>
          <div
            onClick={() => setMobileNavOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(3, 7, 18, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 150,
              animation: 'fadeIn 0.2s ease-out',
            }}
          />

          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '300px',
              maxWidth: '85vw',
              height: '100vh',
              background: '#0f172a',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '22px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '16px 0 50px rgba(0,0,0,0.7)',
              zIndex: 160,
              animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              overflowY: 'auto'
            }}
          >
            {/* Drawer Top */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div
                onClick={() => handleNav('/wallet')}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
                }}>
                  <Zap style={{ color: '#fff', width: '20px', height: '20px' }} />
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-display)' }}>
                  VELoop <span style={{ color: '#34d399' }}>Rewards</span>
                </div>
              </div>

              <button
                onClick={() => setMobileNavOpen(false)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '9px', padding: '6px', color: '#94a3b8', cursor: 'pointer'
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Profile Card in Drawer */}
            {isLoggedIn && wallet ? (
              <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                padding: '16px', borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', flexDirection: 'column', gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={wallet.avatarUrl}
                    alt={wallet.userName}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(wallet.userName)}&background=059669&color=fff`; }}
                  />
                  <div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#f8fafc' }}>{wallet.userName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, marginTop: '2px' }}>
                      <ShieldCheck style={{ width: '12px', height: '12px' }} />
                      {wallet.tier} Member
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap style={{ width: '14px', height: '14px', fill: '#34d399', color: '#34d399' }} />
                    <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>{wallet.balances.VEs.toLocaleString()}</strong> VEs
                  </div>

                  <button
                    onClick={() => { onLogout(); setMobileNavOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)',
                      color: '#fda4af', padding: '6px 12px', borderRadius: '8px',
                      fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    <LogOut style={{ width: '13px', height: '13px' }} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNav('/login')}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                <LogIn style={{ width: '18px', height: '18px' }} />
                Login Now
              </button>
            )}

            {/* Navigation links in Drawer */}
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.9px', marginTop: '6px' }}>
              Navigation Menu
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {navLinks.map(({ path, label, Icon }) => {
                const isActive = currentPath === path;
                return (
                  <button
                    key={path}
                    onClick={() => handleNav(path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '13px 16px', borderRadius: '12px', border: 'none',
                      fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '0.94rem',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(16, 185, 129, 0.18)' : 'rgba(30, 41, 59, 0.6)',
                      color: isActive ? '#34d399' : '#cbd5e1',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px', color: isActive ? '#34d399' : 'inherit' }} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Backend Status footer */}
            {apiStatus !== 'unknown' && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, marginTop: 'auto'
              }}>
                <span>Backend:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: apiStatus === 'live' ? '#34d399' : '#fbbf24', fontWeight: 800 }}>
                  <span className={`status-dot ${apiStatus === 'live' ? 'status-dot-live' : 'status-dot-mock'}`} />
                  {apiStatus === 'live' ? 'CONNECTED' : 'DEMO MODE'}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};
