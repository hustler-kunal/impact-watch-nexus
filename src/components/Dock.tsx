import { useState, useEffect, useRef } from 'react';
import { Telescope, Cpu, Database, ShieldHalf, Home } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import type Lenis from '@studio-freight/lenis';
import { cn } from '@/lib/utils';

declare global { interface Window { lenis?: Lenis } }

import type { ComponentType } from 'react';
type IconType = ComponentType<{ className?: string }>;
interface DockItem {
  id: string;
  label: string;
  icon: IconType;
  target: string; // hash id
}

const items: DockItem[] = [
  { id: 'home', label: 'Home', icon: Home, target: '#top' },
  { id: 'features', label: 'Features', icon: Telescope, target: '#features' },
  { id: 'sim', label: 'Simulator', icon: Cpu, target: '#simulator' },
  { id: 'data', label: 'Data', icon: Database, target: '#nasa-data' },
  { id: 'strategies', label: 'Strategies', icon: ShieldHalf, target: '#strategies' },
];

const scrollTo = (hash: string) => {
  const id = hash.replace('#','');
  if (id === 'top') { window.scrollTo({ top:0, behavior:'smooth'}); return; }
  const el = document.getElementById(id);
  if (el) {
    if (window.lenis) { window.lenis.scrollTo(el, { offset: -80 }); }
    else { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
};

export const Dock = () => {
  const [active, setActive] = useState<string>('home');
  // Always visible (sticky style)
  const [lastY, setLastY] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mouseXRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const centersRef = useRef<number[]>([]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setLastY(y);
      // Determine active section
      const sectionIds = ['simulator','nasa-data','strategies','features'];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.25) {
          setActive(id === 'simulator' ? 'sim' : id === 'nasa-data' ? 'data' : id);
          break;
        }
      }
      if (y < 200) setActive('home');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY]);

  // Compute centers when mounted / resized
  useEffect(() => {
    const computeCenters = () => {
      centersRef.current = btnRefs.current.map(btn => btn ? (btn.getBoundingClientRect().left + btn.getBoundingClientRect().width / 2) : 0);
    };
    computeCenters();
    window.addEventListener('resize', computeCenters);
    return () => window.removeEventListener('resize', computeCenters);
  }, []);

  // (Removed sliding pill highlight in favor of per-button active background for perfect alignment)

  // Magnification effect using requestAnimationFrame + direct DOM style mutation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const influence = 140; // px radius of influence
    const maxScale = 1.45;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const mouseX = mouseXRef.current;
      if (mouseX == null) return;
      const centers = centersRef.current;
      btnRefs.current.forEach((btn, idx) => {
        if (!btn) return;
        const dist = Math.abs(mouseX - centers[idx]);
        const ratio = Math.max(0, (influence - dist) / influence); // 0..1
        const scale = 1 + (maxScale - 1) * Math.pow(ratio, 2); // ease
        const lift = (scale - 1) * 20; // translateY up to ~9px
        btn.style.transform = `translateY(-${lift.toFixed(2)}px) scale(${scale.toFixed(3)})`;
      });
    };
    frameRef.current = requestAnimationFrame(animate);

    const handleMove = (e: PointerEvent) => {
      mouseXRef.current = e.clientX;
    };
    const handleLeave = () => {
      mouseXRef.current = null;
      // reset transforms
      btnRefs.current.forEach(btn => {
        if (btn) btn.style.transform = '';
      });
    };
    container.addEventListener('pointermove', handleMove);
    container.addEventListener('pointerleave', handleLeave);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      container.removeEventListener('pointermove', handleMove);
      container.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return (
  <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div
        ref={containerRef}
        className="relative flex gap-2 px-3 py-1.5 rounded-3xl backdrop-blur-xl bg-background/60 dark:bg-background/40 border border-border/60 shadow-[0_4px_30px_-5px_hsl(var(--primary)/0.25)]"
      >
        {/* highlight pill removed */}
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive = (item.id === active);
          return (
            <button
              ref={el => (btnRefs.current[idx] = el)}
              key={item.id}
              onClick={() => { scrollTo(item.target); }}
              aria-label={item.label}
              className={cn(
                'relative group w-10 h-10 flex items-center justify-center rounded-2xl transition-colors duration-300 will-change-transform',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className={cn('absolute inset-0 rounded-2xl opacity-0 scale-90 transition-all duration-300 bg-gradient-to-br from-primary/25 to-secondary/25 shadow-[0_0_0_1px_hsl(var(--primary)/0.25),0_8px_20px_-8px_hsl(var(--primary)/0.5)]', isActive && 'opacity-100 scale-100')} />
              <Icon className={cn('w-5 h-5 drop-shadow-sm relative z-10')} />
              <span className="pointer-events-none absolute -top-7 text-[10px] font-medium px-2 py-1 rounded-md bg-card/90 backdrop-blur border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
            </button>
          );
        })}
        <div className="w-px bg-border/60 mx-1" />
        <div className="flex items-center justify-center w-10 h-10">
          <ThemeToggle iconOnly />
        </div>
      </div>
    </div>
  );
};

export default Dock;
