import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DevControlBar } from './components/DevControlBar';
import { WalletDashboard } from './pages/WalletDashboard';
import { PayoutFlow } from './pages/PayoutFlow';
import { LoginDemo } from './pages/LoginDemo';
import { WithdrawalsPage } from './pages/WithdrawalsPage';
import { apiClient } from './services/apiClient';
import type { UserWallet } from './types/rewards';

// ─── Simple auth guard ───────────────────────────────────────────────────────
const isAuthenticated = () => Boolean(localStorage.getItem('veloop_access_token'));

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Redirect to login if not authenticated (but allow login page)
    if (!isAuthenticated()) return '/login';
    return '/wallet';
  });

  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchGlobalWallet = async () => {
    if (!isAuthenticated()) return;
    try {
      const data = await apiClient.getWallet();
      setWallet(data);
    } catch {
      // Handled inside page views
    }
  };

  useEffect(() => {
    fetchGlobalWallet();
  }, [refreshTrigger, currentPath]);

  const handleNavigate = (path: string) => {
    // Guard protected routes
    if (path !== '/login' && !isAuthenticated()) {
      setCurrentPath('/login');
      return;
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStateChange = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('veloop_access_token');
    setWallet(null);
    handleNavigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Top Header — hidden on login page */}
      {currentPath !== '/login' && (
        <Header
          currentPath={currentPath}
          onNavigate={handleNavigate}
          wallet={wallet}
          onLogout={handleLogout}
        />
      )}

      {/* Main content */}
      <main>
        {currentPath === '/wallet' && (
          <WalletDashboard
            onNavigate={handleNavigate}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentPath === '/payout' && (
          <PayoutFlow
            onNavigate={handleNavigate}
            onPayoutCompleted={handleStateChange}
          />
        )}

        {currentPath === '/withdrawals' && (
          <WithdrawalsPage
            onNavigate={handleNavigate}
            onWalletRefresh={handleStateChange}
          />
        )}

        {currentPath === '/login' && (
          <LoginDemo
            onLoginSuccess={() => {
              handleStateChange();
              handleNavigate('/wallet');
            }}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Dev Testing Control Bar */}
      {currentPath !== '/login' && (
        <DevControlBar onStateChange={handleStateChange} />
      )}
    </div>
  );
}

export default App;
