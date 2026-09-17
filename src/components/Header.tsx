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
    { path: '/wallet',      label: 'Dashboard',     Icon: Wallet,      activeColor: '#10B981' },
    { path: '/payout',      label: 'Payout / Redeem', Icon: ArrowUpRight, activeColor: '#10B981' },
    { path: '/withdrawals', label: 'Withdrawals',   Icon: History,     activeColor: '#8B5CF6' },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileNavOpen(false);
  };

  return (
    <header className="header-bar">
      <div
        className="app-container"
        style={{ padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px', gap: '16px' }}
      >
        {/* ── Logo ── */}
        <div
          onClick={() => handleNav('/wallet')}
          style={{ display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '11px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)',
          }}>
            <Zap style={{ color: '#fff', width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{
              fontSize: '1.18rem', fontWeight: 800, letterSpacing: '-0.4px',
              background: 'linear-gradient(90deg, #FFFFFF 0%, #CBD5E1 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              VELoop <span style={{ color: '#10B981', WebkitTextFillColor: '#10B981' }}>Rewards</span>
            </div>
            <div style={{ fontSize: '0.66rem', color: '#4e6072', fontWeight: 700, letterSpacing: '0.8px' }}>
              WALLET &amp; PAYOUTS
            </div>
          </div>
        </div>

        {/* ── Desktop Nav ── */}
        <nav
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'rgba(7, 12, 24, 0.8)',
            padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
          className="desktop-nav"
        >
          {navLinks.map(({ path, label, Icon, activeColor }) => {
            const isActive = currentPath === path;
            return (
              <button
                key={path}
                id={`nav-${path.slice(1)}`}
                onClick={() => handleNav(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '8px 15px', borderRadius: '8px', border: 'none',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.83rem',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  borderColor: isActive ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                  color: isActive ? '#fff' : '#64748B',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon style={{ width: '15px', height: '15px', color: isActive ? activeColor : 'inherit' }} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* ── Right: Status + VEs + User ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* API Status Dot */}
          {apiStatus !== 'unknown' && (
            <div
              title={apiStatus === 'live' ? 'Connected to live backend' : 'Demo mode (backend offline)'}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 700, color: '#4e6072', cursor: 'default' }}
            >
              <span className={`status-dot ${apiStatus === 'live' ? 'status-dot-live' : 'status-dot-mock'}`} />
              <span style={{ display: 'none' }} className="api-status-label">
                {apiStatus === 'live' ? 'LIVE' : 'DEMO'}
              </span>
            </div>
          )}

          {/* VEs Chip */}
          {isLoggedIn && wallet && (
            <div className="ves-chip" id="header-ves-balance">
              <Zap style={{ width: '15px', height: '15px', fill: '#10B981', color: '#10B981', flexShrink: 0 }} />
              <span className="tabular-num">{wallet.balances.VEs.toLocaleString()}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>VEs</span>
            </div>
          )}

          {/* User Pill / Login Now Button */}
          {isLoggedIn && wallet ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              background: 'rgba(20, 30, 50, 0.6)',
              padding: '5px 12px 5px 5px', borderRadius: '40px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}>
              <img
                src={wallet.avatarUrl}
                alt={wallet.userName}
                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(wallet.userName)}&background=10b981&color=fff`; }}
              />
              <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f0f6ff' }}>{wallet.userName}</div>
                <div style={{ fontSize: '0.65rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                  <ShieldCheck style={{ width: '10px', height: '10px' }} />
                  {wallet.tier}
                </div>
              </div>
              <button
                onClick={onLogout}
                id="header-logout-btn"
                title="Switch Demo User / Logout"
                style={{ background: 'none', border: 'none', color: '#4e6072', cursor: 'pointer', padding: '4px', marginLeft: '2px', borderRadius: '6px', transition: 'color 0.15s ease' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#f87171')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#4e6072')}
              >
                <LogOut style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={() => handleNav('/login')}
              className="btn-primary"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.83rem', fontWeight: 700, padding: '9px 18px',
                borderRadius: '30px',
              }}
            >
              <LogIn style={{ width: '15px', height: '15px' }} />
              Login Now
            </button>
          )}

          {/* Mobile Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            style={{
              display: 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '9px', padding: '8px', cursor: 'pointer', color: '#94a3b8',
            }}
          >
            {mobileNavOpen ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div style={{
          background: 'rgba(7, 12, 24, 0.98)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 18px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {navLinks.map(({ path, label, Icon }) => {
            const isActive = currentPath === path;
            return (
              <button
                key={path}
                onClick={() => handleNav(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', borderRadius: '10px', border: 'none',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.92rem',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  color: isActive ? '#34d399' : '#94a3b8',
                  textAlign: 'left',
                }}
              >
                <Icon style={{ width: '17px', height: '17px' }} />
                {label}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .api-status-label { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};
