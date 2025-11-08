import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Guardians } from './pages/Guardians';
import { Reports } from './pages/Reports';
import { Relayer } from './pages/Relayer';
import { Compliance } from './pages/Compliance';
import { ZentixOS } from './pages/ZentixOS';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CommandPalette } from './components/ui/CommandPalette';
import { ActivityFeed } from './components/ui/ActivityFeed';
import { KeyboardHint } from './components/ui/KeyboardHint';
import { AICopilot } from './components/ui/AICopilot';
import Referrals from './pages/Referrals';
import Performance from './pages/Performance';
import { QuantumLayout } from './components/quantum/QuantumLayout';
import { QuantumDashboard } from './pages/quantum/QuantumDashboard';
import { QuantumAgents } from './pages/quantum/QuantumAgents';
import { QuantumSynchronizer } from './pages/quantum/QuantumSynchronizer';
import { QuantumSuperchain } from './pages/quantum/QuantumSuperchain';
import { QuantumWallet } from './pages/quantum/QuantumWallet';
import { QuantumRewards } from './pages/quantum/QuantumRewards';
import { QuantumGovernance } from './pages/quantum/QuantumGovernance';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ToastProvider>
          <BrowserRouter>
            <CommandPalette />
            <ActivityFeed />
            <KeyboardHint />
            <AICopilot />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="guardians" element={<Guardians />} />
                <Route path="reports" element={<Reports />} />
                <Route path="relayer" element={<Relayer />} />
                <Route path="compliance" element={<Compliance />} />
                <Route path="referrals" element={<Referrals />} />
                <Route path="performance" element={<Performance />} />
                <Route path="zentixos" element={<ZentixOS />} />
              </Route>
              
              {/* Quantum Governance Routes */}
              <Route path="/quantum" element={<QuantumLayout />}>
                <Route index element={<QuantumDashboard />} />
                <Route path="agents" element={<QuantumAgents />} />
                <Route path="synchronizer" element={<QuantumSynchronizer />} />
                <Route path="superchain" element={<QuantumSuperchain />} />
                <Route path="wallet" element={<QuantumWallet />} />
                <Route path="rewards" element={<QuantumRewards />} />
                <Route path="governance" element={<QuantumGovernance />} />
              </Route>
              
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;