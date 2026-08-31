import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

const STORAGE_KEY = 'mailpilot-theme';

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeToDocument = (resolved: ResolvedTheme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  initTheme: () => {
    const savedTheme = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
    const resolved = savedTheme === 'system' ? getSystemTheme() : (savedTheme as ResolvedTheme);

    applyThemeToDocument(resolved);
    set({ theme: savedTheme, resolvedTheme: resolved });

    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (get().theme === 'system') {
          const newResolved = getSystemTheme();
          applyThemeToDocument(newResolved);
          set({ resolvedTheme: newResolved });
        }
      };

      mediaQuery.removeEventListener?.('change', handleChange);
      mediaQuery.addEventListener?.('change', handleChange);
    }
  },

  setTheme: (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    const resolved = newTheme === 'system' ? getSystemTheme() : (newTheme as ResolvedTheme);
    applyThemeToDocument(resolved);
    set({ theme: newTheme, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const current = get().resolvedTheme;
    const nextTheme: Theme = current === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  }
}));
