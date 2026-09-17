import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertTriangle, UserCheck, Clock, Layers, Zap } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { apiClient } from '../services/apiClient';
import type { DevSettings } from '../types/rewards';

interface DevControlBarProps {
  onStateChange: () => void;
}

export const DevControlBar: React.FC<DevControlBarProps> = ({ onStateChange }) => {
  const [settings, setSettings] = useState<DevSettings>(mockBackend.getSettings());
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const updateSetting = (changes: Partial<DevSettings>) => {
    const updated = mockBackend.updateSettings(changes);
    setSettings(updated);
    onStateChange();
  };

  const handleReset = () => {
    mockBackend.resetData();
    setSettings(mockBackend.getSettings());
    onStateChange();
  };

  return (
    <div className="dev-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="btn-secondary" 
          style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#1E293B', borderColor: '#334155' }}
        >
          <Sliders style={{ width: '14px', height: '14px', color: '#10B981' }} />
          <span>Demo Controls {isOpen ? '▲' : '▼'}</span>
        </button>

        <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
          REST API Testing Panel (Simulates Backend State)
        </span>
      </div>

      {isOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Latency Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <Clock style={{ width: '13px', height: '13px', color: '#64748B' }} />
            <span style={{ color: '#94A3B8' }}>Latency:</span>
            <select
              value={settings.simulatedDelayMs}
              onChange={(e) => updateSetting({ simulatedDelayMs: Number(e.target.value) })}
              style={{ background: '#0F172A', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '6px', padding: '3px 8px', fontSize: '0.78rem' }}
            >
              <option value={0}>0ms (Instant)</option>
              <option value={600}>600ms (Default)</option>
              <option value={1500}>1.5s (Slow 3G)</option>
            </select>
          </div>

          {/* User Preset Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <UserCheck style={{ width: '13px', height: '13px', color: '#64748B' }} />
            <span style={{ color: '#94A3B8' }}>User Balance:</span>
            <select
              value={settings.userPreset}
              onChange={(e) => updateSetting({ userPreset: e.target.value as 'high' | 'low' })}
              style={{ background: '#0F172A', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '6px', padding: '3px 8px', fontSize: '0.78rem' }}
            >
              <option value="high">High Balance (2,450 VEs)</option>
              <option value="low">Low Balance (180 VEs)</option>
            </select>
          </div>

          {/* Empty State Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94A3B8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.emptyTransactions}
              onChange={(e) => updateSetting({ emptyTransactions: e.target.checked })}
              style={{ accentColor: '#10B981' }}
            />
            <Layers style={{ width: '13px', height: '13px' }} />
            Empty History
          </label>

          {/* Wallet Error Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94A3B8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.forceWalletFetchError}
              onChange={(e) => updateSetting({ forceWalletFetchError: e.target.checked })}
              style={{ accentColor: '#F43F5E' }}
            />
            <AlertTriangle style={{ width: '13px', height: '13px', color: '#F43F5E' }} />
            Force Wallet Error (500)
          </label>

          {/* Payout Error Injector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <span style={{ color: '#94A3B8' }}>Payout Error Injector:</span>
            <select
              value={settings.forcePayoutErrorType}
              onChange={(e) => updateSetting({ forcePayoutErrorType: e.target.value as any })}
              style={{ background: '#0F172A', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '6px', padding: '3px 8px', fontSize: '0.78rem' }}
            >
              <option value="none">None (Normal)</option>
              <option value="insufficient_balance">Insufficient Balance</option>
              <option value="inactive_method">Inactive Method</option>
              <option value="duplicate_request">Duplicate Request</option>
              <option value="server_error">Gateway 504 Error</option>
            </select>
          </div>

          {/* Quick Add VEs Button */}
          <button
            onClick={async () => {
              await apiClient.creditWallet(1000);
              onStateChange();
            }}
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Zap style={{ width: '12px', height: '12px', fill: '#34D399' }} />
            + Add 1,000 VEs
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid #334155',
              color: '#CBD5E1',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw style={{ width: '12px', height: '12px' }} />
            Reset Data
          </button>
        </div>
      )}
    </div>
  );
};
