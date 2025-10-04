import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import type Lenis from "@studio-freight/lenis";

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

const navItems: { label: string; href: string }[] = [
  { label: "Home", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "Simulator", href: "#simulator" },
  { label: "Data", href: "#nasa-data" },
  { label: "Strategies", href: "#strategies" }
];

const scrollTo = (hash: string) => {
  const id = hash.replace('#', '');
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.getElementById(id);
  if (el) {
    // Prefer Lenis if available for consistency
    if (window.lenis) {
      window.lenis.scrollTo(el, { offset: -80 });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        scrolled ? "backdrop-blur-md bg-background/80 border-b border-border" : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); scrollTo('#top'); }}
          className="font-bold text-lg tracking-tight flex items-center gap-2"
        >
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent dark:drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]">
              Impact Watch Nexus
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollTo(item.href); }}
                className="relative text-muted-foreground hover:text-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gradient-to-r after:from-primary after:to-secondary hover:after:w-full after:transition-all after:duration-300"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-card/60 backdrop-blur hover:bg-card/80"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span className={cn("block h-0.5 w-5 bg-foreground transition", open && "translate-y-2 rotate-45")}></span>
              <span className={cn("block h-0.5 w-5 bg-foreground transition", open && "opacity-0")}></span>
              <span className={cn("block h-0.5 w-5 bg-foreground transition", open && "-translate-y-2 -rotate-45")}></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-[max-height,opacity] duration-300 backdrop-blur bg-background/90 border-b border-border",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="px-6 py-4 flex flex-col gap-4 text-sm font-medium">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollTo(item.href); setOpen(false); }}
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
