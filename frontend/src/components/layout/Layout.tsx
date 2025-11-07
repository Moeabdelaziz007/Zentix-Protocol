import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { FloatingOrbs } from '../ui/FloatingOrbs';

export function Layout() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingOrbs />
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 -z-5 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <Header />
      
      <main className="container mx-auto px-6 py-10 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}