import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

/* Simple theme toggler: toggles 'dark' class on <html>. Persists preference in localStorage. */
export const ThemeToggle = ({ className }: { className?: string }) => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme-preference");
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'light' || stored === 'dark') {
      if (stored === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
      setIsDark(stored === 'dark');
    } else {
      if (systemPrefersDark) root.classList.add('dark');
      setIsDark(root.classList.contains('dark'));
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const makeDark = !root.classList.contains('dark');
    if (makeDark) {
      root.classList.add('dark');
      localStorage.setItem('theme-preference', 'dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme-preference', 'light');
      setIsDark(false);
    }
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
        "bg-card/60 backdrop-blur-sm hover:bg-card/80 border-border",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
    >
      {isDark ? <Sun size={16} className="text-primary" /> : <Moon size={16} className="text-primary" />}
      <span>{isDark ? 'Day' : 'Night'}</span>
    </button>
  );
};

export default ThemeToggle;
