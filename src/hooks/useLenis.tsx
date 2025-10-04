import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

type LenisScrollEvent = {
  velocity: number;
  direction: number;
  scroll: number;
};

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

export const useLenis = () => {
  useEffect(() => {
    // A slightly longer duration + lower lerp gives a “glide” feeling without jank.
    // clampWheel speeds up reaction while keeping easing fluid.
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.07,            // responsiveness vs smoothness balance
      wheelMultiplier: 1,
      touchMultiplier: 1,
      duration: 1.0,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    window.lenis = lenis;

    let lastStamp = 0;
    const handleScrollTelemetry = ({ velocity, direction, scroll }: LenisScrollEvent) => {
      const now = performance.now();
      // Throttle DOM writes to ~30fps (every ~33ms) to avoid layout jank on low-end GPUs
      if (now - lastStamp < 33) return;
      lastStamp = now;
      const v = Math.abs(velocity);
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty("--scroll-velocity", v.toFixed(3));
      rootStyle.setProperty("--scroll-direction", direction.toString());
      rootStyle.setProperty("--scroll-progress", scroll.toFixed(2));
    };

    lenis.on("scroll", handleScrollTelemetry);

    let frameId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    const handleResize = () => {
      lenis.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      lenis.off("scroll", handleScrollTelemetry);
      cancelAnimationFrame(frameId);
      lenis.destroy();
      if (window.lenis === lenis) {
        delete window.lenis;
      }
    };
  }, []);
};
