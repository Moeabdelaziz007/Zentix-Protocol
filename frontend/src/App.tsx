import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="guardians" element={<Guardians />} />
                <Route path="reports" element={<Reports />} />
                <Route path="relayer" element={<Relayer />} />
                <Route path="compliance" element={<Compliance />} />
                <Route path="referrals" element={<Referrals />} />
                <Route path="performance" element={<Performance />} />
                <Route path="zentixos" element={<ZentixOS />} />
                <Route path="*" element={<Dashboard />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;