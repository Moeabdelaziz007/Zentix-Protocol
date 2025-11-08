import { NavLink } from 'react-router-dom';
import { House, Cpu, Waypoints, Link, BookOpenText, Wallet, Trophy } from 'lucide-react';

const navItems = [
  { path: '/quantum', icon: House, label: 'Dashboard' },
  { path: '/quantum/agents', icon: Cpu, label: 'Agents' },
  { path: '/quantum/synchronizer', icon: Waypoints, label: 'Quantum Synchronizer' },
  { path: '/quantum/superchain', icon: Link, label: 'Superchain Bridge' },
  { path: '/quantum/wallet', icon: Wallet, label: 'Wallet & Assets' },
  { path: '/quantum/rewards', icon: Trophy, label: 'Rewards' },
  { path: '/quantum/governance', icon: BookOpenText, label: 'Governance' }
];

export function QuantumSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-quantum-surface border-r border-quantum-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-quantum-border">
        <h1 className="text-2xl font-bold text-quantum-cyan glow-cyan">
          Zentix Protocol
        </h1>
        <p className="text-xs text-quantum-text-muted mt-1">Quantum Governance</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-quantum-cyan/10 text-quantum-cyan border border-quantum-cyan glow-cyan'
                  : 'text-quantum-text-secondary hover:bg-quantum-border hover:text-quantum-text-primary'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}