import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';
import { Sparkles } from 'lucide-react';

export function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/guardians', label: 'Guardians' },
    { path: '/reports', label: 'Reports' },
    { path: '/relayer', label: 'Relayer' },
    { path: '/compliance', label: 'Compliance' },
    { path: '/zentixos', label: 'ZentixOS' },
  ];

  return (
    <header className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text font-display">
                  Zentix Protocol
                </h1>
                <p className="text-xs text-muted-foreground font-medium">AI-Powered Security</p>
              </div>
            </Link>
            
            <nav className="hidden lg:flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'text-foreground hover:bg-muted hover:text-primary'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}