import { Outlet } from 'react-router-dom';
import { QuantumSidebar } from './QuantumSidebar';

export function QuantumLayout() {
  return (
    <div className="min-h-screen bg-quantum-bg">
      <QuantumSidebar />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}