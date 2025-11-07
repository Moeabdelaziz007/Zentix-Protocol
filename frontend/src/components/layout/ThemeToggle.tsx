import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      className="w-10 h-10 p-0"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
}