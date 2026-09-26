import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertTriangle, UserCheck, Clock, Layers, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { apiClient } from '../services/apiClient';
import type { DevSettings } from '../types/rewards';

interface DevControlBarProps {
  onStateChange: () => void;
  onNavigate?: (path: string) => void;
}

export const DevControlBar: React.FC<DevControlBarProps> = ({ onStateChange, onNavigate }) => {
  const [settings, setSettings] = useState<DevSettings>(mockBackend.getSettings());
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const updateSetting = (changes: Partial<DevSettings>) => {
    const updated = mockBackend.updateSettings(changes);
    setSettings(updated);
    onStateChange();
  };

  const handleReset = () => {
    if (!localStorage.getItem('veloop_access_token')) {
      if (onNavigate) onNavigate('/login');
      return;
    }
    mockBackend.resetData();
    setSettings(mockBackend.getSettings());
    onStateChange();
  };

  return (
    <div className="dev-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="btn-secondary" 
          style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(255, 255, 255, 0.12)', color: '#f8fafc' }}
        >
          <Sliders style={{ width: '14px', height: '14px', color: '#34d399' }} />
          <span style={{ fontWeight: 800 }}>Demo &amp; Testing Controls</span>
          {isOpen ? <ChevronDown style={{ width: '14px', height: '14px' }} /> : <ChevronUp style={{ width: '14px', height: '14px' }} />}
        </button>

        <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
          Simulates REST API responses &amp; edge cases
        </span>
      </div>

      {isOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', width: '100%', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          
          {/* Latency */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <Clock style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
            <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Latency:</span>
            <select
              value={settings.simulatedDelayMs}
              onChange={(e) => updateSetting({ simulatedDelayMs: Number(e.target.value) })}
              style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '4px 8px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <option value={0}>0ms (Instant)</option>
              <option value={600}>600ms (Default)</option>
              <option value={1500}>1.5s (Slow 3G)</option>
            </select>
          </div>

          {/* User Preset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <UserCheck style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
            <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Balance Preset:</span>
            <select
              value={settings.userPreset}
              onChange={(e) => updateSetting({ userPreset: e.target.value as 'high' | 'low' })}
              style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '4px 8px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <option value="high">High Balance (25,000 VEs)</option>
              <option value="low">Low Balance (180 VEs)</option>
            </select>
          </div>

          {/* Empty History Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.emptyTransactions}
              onChange={(e) => updateSetting({ emptyTransactions: e.target.checked })}
              style={{ accentColor: '#10b981' }}
            />
            <Layers style={{ width: '13px', height: '13px' }} />
            Empty History
          </label>

          {/* Wallet Error Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.forceWalletFetchError}
              onChange={(e) => updateSetting({ forceWalletFetchError: e.target.checked })}
              style={{ accentColor: '#fb7185' }}
            />
            <AlertTriangle style={{ width: '13px', height: '13px', color: '#fb7185' }} />
            Force 500 Error
          </label>

          {/* Error Injector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Inject Error:</span>
            <select
              value={settings.forcePayoutErrorType}
              onChange={(e) => updateSetting({ forcePayoutErrorType: e.target.value as any })}
              style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '4px 8px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <option value="none">None (Normal)</option>
              <option value="insufficient_balance">Insufficient Balance</option>
              <option value="inactive_method">Inactive Method</option>
              <option value="duplicate_request">Duplicate Request</option>
              <option value="server_error">Gateway 504 Error</option>
            </select>
          </div>

          {/* Quick Credit VEs Button */}
          <button
            onClick={async () => {
              if (!localStorage.getItem('veloop_access_token')) {
                if (onNavigate) onNavigate('/login');
                return;
              }
              await apiClient.creditWallet(1000);
              onStateChange();
            }}
            style={{
              background: 'rgba(16, 185, 129, 0.18)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              borderRadius: '8px',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Zap style={{ width: '13px', height: '13px', fill: '#34d399' }} />
            + Add 1,000 VEs
          </button>

          {/* Reset Data Button */}
          <button
            onClick={handleReset}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#cbd5e1',
              borderRadius: '8px',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <RefreshCw style={{ width: '13px', height: '13px' }} />
            Reset Demo Data
          </button>
        </div>
      )}
    </div>
  );
};
