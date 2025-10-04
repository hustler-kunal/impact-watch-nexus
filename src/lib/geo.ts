// Geographic & impact physics utilities
// Provides: coordinate conversions, distance calculations, basic impact energy / crater estimates
// NOTE: These are simplified scientific models for educational visualization, not authoritative predictions.

export interface LatLon { lat: number; lon: number }

const R_EARTH_KM = 6371; // mean Earth radius

export function deg2rad(d: number) { return d * Math.PI / 180; }
export function rad2deg(r: number) { return r * 180 / Math.PI; }

// Great-circle distance (Haversine) in km
export function haversine(a: LatLon, b: LatLon): number {
  const dLat = deg2rad(b.lat - a.lat);
  const dLon = deg2rad(b.lon - a.lon);
  const lat1 = deg2rad(a.lat);
  const lat2 = deg2rad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R_EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Convert lat/lon to 3D Cartesian on unit sphere
export function latLonToVector(lat: number, lon: number) {
  const phi = deg2rad(90 - lat); // polar angle
  const theta = deg2rad(lon + 180);
  const x = Math.sin(phi) * Math.cos(theta);
  const z = Math.sin(phi) * Math.sin(theta);
  const y = Math.cos(phi);
  return { x, y, z };
}

// Simple impact energy (Joules): 0.5 * m * v^2; m from density * volume (sphere)
// diameter in meters, v (m/s), density (kg/m^3)
export function impactEnergyJ(diameterM: number, velocity: number, density=3000) {
  const r = diameterM / 2;
  const volume = (4/3) * Math.PI * r**3;
  const mass = volume * density;
  return 0.5 * mass * velocity**2;
}

// TNT equivalent (rough) 1 ton TNT ~ 4.184e9 Joules
export function energyToTonsTNT(joules: number) {
  return joules / 4.184e9; // metric tons of TNT
}

// Simplified transient crater diameter model (Melosh approximation) VERY approximate
// Returns crater diameter (m)
export function estimateCraterDiameterM(diameterM: number, velocity: number, density=3000, targetDensity=2500, gravity=9.81) {
  // Pi-scaling simplification: D ~ k * ( (g * d / v^2) ^ -0.22 ) * d
  const k = 1.8; // tuned constant for visual plausibility
  const term = gravity * diameterM / (velocity**2);
  return k * Math.pow(term, -0.22) * diameterM * (density/targetDensity)**0.3;
}

// Atmospheric entry deceleration factor (very simplified) based on diameter & velocity
export function entryAttenuationFactor(diameterM: number, velocity: number, angleDeg=45) {
  // Larger & faster objects lose smaller fraction; shallow angles lose more energy
  const angleFactor = Math.sin(deg2rad(angleDeg));
  const sizeFactor = Math.min(1, diameterM / 500); // saturate at 500m
  const velocityFactor = Math.min(1, velocity / 30000); // saturate at 30 km/s
  const retained = 0.3 + 0.7 * (0.4*sizeFactor + 0.6*velocityFactor) * angleFactor;
  return Math.min(1, Math.max(0, retained));
}

export interface ImpactSimulationInput {
  diameterM: number;        // asteroid diameter
  velocity: number;         // m/s
  density?: number;         // kg/m^3
  angleDeg?: number;        // entry angle
  targetType?: 'ocean' | 'land' | 'mountain';
}

export interface ImpactSimulationResult {
  impactEnergyJ: number;
  energyTonsTNT: number;
  retainedEnergyJ: number;
  craterDiameterM: number;
  tsunamiPotential: boolean;
  seismicSeverity: string;
  notes: string[];
}

export function simulateImpact(input: ImpactSimulationInput): ImpactSimulationResult {
  const { diameterM, velocity, density=3000, angleDeg=45, targetType='land' } = input;
  const E = impactEnergyJ(diameterM, velocity, density);
  const atten = entryAttenuationFactor(diameterM, velocity, angleDeg);
  const retained = E * atten;
  const crater = targetType === 'ocean' ? estimateCraterDiameterM(diameterM, velocity) * 0.7 : estimateCraterDiameterM(diameterM, velocity);
  const tons = energyToTonsTNT(retained);
  const tsunami = targetType === 'ocean';
  const seismic = tons > 1e7 ? 'extreme' : tons > 1e5 ? 'severe' : tons > 1e3 ? 'moderate' : 'low';
  const notes: string[] = [];
  if (tsunami) notes.push('Potential large tsunami generation');
  if (targetType === 'mountain') notes.push('Mountain terrain reduces crater size and increases ejecta confinement');
  if (atten < 0.6) notes.push('Significant atmospheric energy loss');
  if (tons > 1e6) notes.push('Global climatic effects possible');
  return { impactEnergyJ: E, energyTonsTNT: tons, retainedEnergyJ: retained, craterDiameterM: crater, tsunamiPotential: tsunami, seismicSeverity: seismic, notes };
}

// Format helpers
export function formatNumber(n: number, digits=2) {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n/1e9).toFixed(digits)+'B';
  if (abs >= 1e6) return (n/1e6).toFixed(digits)+'M';
  if (abs >= 1e3) return (n/1e3).toFixed(digits)+'k';
  if (abs < 0.01) return n.toExponential(2);
  return n.toFixed(digits);
}
