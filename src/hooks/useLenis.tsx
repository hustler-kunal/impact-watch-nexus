import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

export const useLenis = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2.5,
      infinite: false,
      lerp: 0.08, // Lower = smoother, more physics-like
    });

    // Track velocity for scroll-based effects
    lenis.on('scroll', ({ velocity, direction, scroll }: any) => {
      // Set velocity as CSS variable for animations
      document.documentElement.style.setProperty('--scroll-velocity', Math.abs(velocity).toString());
      document.documentElement.style.setProperty('--scroll-direction', direction.toString());
      document.documentElement.style.setProperty('--scroll-progress', scroll.toString());
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
};
