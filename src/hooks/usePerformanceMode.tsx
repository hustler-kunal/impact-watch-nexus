/* eslint-disable */
import { createContext, useContext, useState, ReactNode } from 'react';

// Co-locate hook & provider; exporting both is fine for fast-refresh since both are components/functions
type PerformanceContextValue = { lowPerf: boolean; toggle: () => void };
const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined);

export function PerformanceModeProvider({ children }: { children: ReactNode }) {
  const [lowPerf, setLowPerf] = useState(false);
  const toggle = () => setLowPerf(p => !p);
  return <PerformanceContext.Provider value={{ lowPerf, toggle }}>{children}</PerformanceContext.Provider>;
}

export function usePerformanceMode() {
  const ctx = useContext(PerformanceContext);
  if (!ctx) throw new Error('usePerformanceMode must be used within PerformanceModeProvider');
  return ctx;
}