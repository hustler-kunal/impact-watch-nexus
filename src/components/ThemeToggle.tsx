import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

/* Simple theme toggler: toggles 'dark' class on <html>. Persists preference in localStorage. */
interface ThemeToggleProps { className?: string; iconOnly?: boolean }

export const ThemeToggle = ({ className, iconOnly = false }: ThemeToggleProps) => {
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

  const baseClasses = iconOnly
    ? "inline-flex items-center justify-center rounded-xl border w-10 h-10 transition-colors bg-card/60 backdrop-blur hover:bg-card/80 border-border"
    : "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors bg-card/60 backdrop-blur-sm hover:bg-card/80 border-border";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        baseClasses,
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
    >
      {isDark ? <Sun size={18} className="text-primary" /> : <Moon size={18} className="text-primary" />}
      {!iconOnly && <span>{isDark ? 'Day' : 'Night'}</span>}
    </button>
  );
};

export default ThemeToggle;
