import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useThemeStore, Theme } from '../../store/themeStore';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'inline';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'button', className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'inline') {
    const options: Array<{ id: Theme; label: string; icon: React.ReactNode }> = [
      { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
      { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
      { id: 'system', label: 'System', icon: <Laptop className="w-4 h-4" /> }
    ];

    return (
      <div className={`flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 ${className}`}>
        {options.map((opt) => {
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/80 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          aria-label="Select theme"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-brand-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="capitalize">{theme}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-36 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => { setTheme('light'); setDropdownOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </div>
              {theme === 'light' && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
            </button>
            <button
              type="button"
              onClick={() => { setTheme('dark'); setDropdownOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-brand-400" />
                <span>Dark</span>
              </div>
              {theme === 'dark' && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
            </button>
            <button
              type="button"
              onClick={() => { setTheme('system'); setDropdownOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                <span>System</span>
              </div>
              {theme === 'system' && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default button variant (direct toggle)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100/90 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:text-white dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-750 transition-all active:scale-95 shadow-subtle inline-flex items-center justify-center ${className}`}
      title={`Current: ${resolvedTheme} mode (Click to toggle)`}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-brand-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
};
