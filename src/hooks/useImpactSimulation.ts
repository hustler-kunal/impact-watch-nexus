import { useMemo } from 'react';
import { simulateImpact, ImpactSimulationInput, ImpactSimulationResult } from '@/lib/geo';

export function useImpactSimulation(params: ImpactSimulationInput) {
  const result: ImpactSimulationResult = useMemo(() => simulateImpact(params), [params]);
  return result;
}

export default useImpactSimulation;