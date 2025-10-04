import { useState, useMemo, useRef, useEffect } from "react";
import { useLenis } from "@/hooks/useLenis";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AsteroidViewer from "@/components/AsteroidViewer";
import ParameterControls from "@/components/ParameterControls";
import ImpactCalculator from "@/components/ImpactCalculator";
import MitigationStrategies from "@/components/MitigationStrategies";
import NASADataPanel from "@/components/NASADataPanel";
import ImpactLocationSelector from "@/components/ImpactLocationSelector"; // legacy presets component (still used inside new panel)
import LocationPickerPanel from "@/components/location/LocationPickerPanel";
import useImpactSimulation from "@/hooks/useImpactSimulation";
import { Card } from "@/components/ui/card";
import TrajectoryTimeline from "@/components/TrajectoryTimeline";
import NASADataIntegration from "@/components/NASADataIntegration";
import DataExport from "@/components/DataExport";
import { Badge } from "@/components/ui/badge";
// Removed top navbar in favor of bottom dock
import Dock from "@/components/Dock";

const Index = () => {
  useLenis();
  
  const simulatorRef = useRef<HTMLElement>(null);
  const nasaRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const revealSelector = ".scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in";
    const elements = Array.from(document.querySelectorAll(revealSelector));
    if (!elements.length) return;

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target); // one-time animation
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  
  const [asteroidSize, setAsteroidSize] = useState(200);
  const [asteroidSpeed, setAsteroidSpeed] = useState(20);
  const [impactAngle, setImpactAngle] = useState(45);
  const [asteroidDistance, setAsteroidDistance] = useState(6);
  const [impactLocation, setImpactLocation] = useState({ lat: 0, lon: -140, name: "Pacific Ocean", type: 'ocean' });

  const handleLocationSelect = (lat: number, lon: number, location: string) => {
    setImpactLocation({ lat, lon, name: location, type: location.toLowerCase().includes('ocean') ? 'ocean' : location.toLowerCase().includes('mountain') ? 'mountain' : 'land' });
  };

  const calculations = useMemo(() => {
    const diameter = asteroidSize;
    const velocity = asteroidSpeed * 1000;
    const density = 3000;
    const radius = diameter / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * density;
    const kineticEnergy = 0.5 * mass * Math.pow(velocity, 2);
    const megatonsTNT = kineticEnergy / (4.184 * Math.pow(10, 15));
    const craterDiameter = 1.8 * Math.pow(megatonsTNT, 0.29) * 1000;
    const richterScale = 0.67 * Math.log10(kineticEnergy) - 5.87;
    const angleEfficiency = Math.sin(impactAngle * Math.PI / 180);
    const tsunamiPotential = diameter > 100 ? "HIGH" : diameter > 50 ? "MODERATE" : "LOW";
    
    let dangerLevel: "MINIMAL" | "MODERATE" | "SEVERE" | "CATASTROPHIC";
    if (megatonsTNT < 1) dangerLevel = "MINIMAL";
    else if (megatonsTNT < 100) dangerLevel = "MODERATE";
    else if (megatonsTNT < 1000) dangerLevel = "SEVERE";
    else dangerLevel = "CATASTROPHIC";

    return {
      mass: (mass / 1000).toFixed(2),
      energy: kineticEnergy.toExponential(2),
      megatonsTNT: megatonsTNT.toFixed(2),
      craterDiameter: craterDiameter.toFixed(0),
      richterScale: richterScale.toFixed(1),
      angleEfficiency: (angleEfficiency * 100).toFixed(0),
      tsunamiPotential,
      dangerLevel
    };
  }, [asteroidSize, asteroidSpeed, impactAngle]);

  // New physically-informed simulation (parallel to existing calculations, can replace later)
  const sim = useImpactSimulation({
    diameterM: asteroidSize,
    velocity: asteroidSpeed * 1000,
    angleDeg: impactAngle,
    targetType: impactLocation.type as 'ocean' | 'land' | 'mountain',
  });

  return (
    <main id="top" className="min-h-screen bg-background">
      <Dock />
      <div>{/* content wrapper */}
      <Hero />
      <Features />

      {/* Simulator Section */}
  <section ref={simulatorRef} id="simulator" className="py-20 px-4 bg-gradient-to-b from-card/10 to-background relative overflow-hidden">
        {/* Animated cosmic background */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full cosmic-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 8}s`
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="text-center mb-12 scroll-fade-in">
            <Badge className="mb-4 bg-accent/20 text-accent border-accent/50 hover-lift">
              Interactive Simulator
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Asteroid Impact <span className="gradient-text">Simulator</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Adjust parameters to visualize different impact scenarios and analyze potential consequences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - 3D Viewer & Location */}
            <div className="space-y-6 scroll-slide-left">
              <AsteroidViewer
                asteroidSize={asteroidSize / 100}
                asteroidSpeed={asteroidSpeed / 10}
                asteroidDistance={asteroidDistance}
              />
              <LocationPickerPanel onChange={handleLocationSelect} />
            </div>

            {/* Right Column - Controls & Calculations */}
            <div className="space-y-6 scroll-slide-right">
              <ParameterControls
                asteroidSize={asteroidSize}
                setAsteroidSize={setAsteroidSize}
                asteroidSpeed={asteroidSpeed}
                setAsteroidSpeed={setAsteroidSpeed}
                impactAngle={impactAngle}
                setImpactAngle={setImpactAngle}
                asteroidDistance={asteroidDistance}
                setAsteroidDistance={setAsteroidDistance}
              />
              <ImpactCalculator
                asteroidSize={asteroidSize}
                asteroidSpeed={asteroidSpeed}
                impactAngle={impactAngle}
              />
              <Card className="p-4 bg-card/60 border-border space-y-3">
                <h4 className="font-semibold text-sm">Impact Physics (Beta)</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono">
                  <span className="text-muted-foreground">Energy TNT:</span>
                  <span>{(sim.energyTonsTNT/1e6).toFixed(2)}M tons</span>
                  <span className="text-muted-foreground">Retained %:</span>
                  <span>{(sim.retainedEnergyJ / sim.impactEnergyJ * 100).toFixed(1)}%</span>
                  <span className="text-muted-foreground">Crater Diam:</span>
                  <span>{(sim.craterDiameterM/1000).toFixed(2)} km</span>
                  <span className="text-muted-foreground">Seismic:</span>
                  <span className="capitalize">{sim.seismicSeverity}</span>
                  <span className="text-muted-foreground">Tsunami:</span>
                  <span>{sim.tsunamiPotential ? 'Yes' : 'No'}</span>
                </div>
                {sim.notes.length > 0 && (
                  <ul className="text-[10px] text-muted-foreground list-disc ml-4 space-y-0.5">
                    {sim.notes.map(n => <li key={n}>{n}</li>)}
                  </ul>
                )}
              </Card>
            </div>
          </div>

          {/* Additional Analysis Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="scroll-scale-in" style={{ transitionDelay: '0.1s' }}>
              <TrajectoryTimeline 
                asteroidSpeed={asteroidSpeed}
                asteroidDistance={asteroidDistance}
              />
            </div>
            <div className="scroll-scale-in" style={{ transitionDelay: '0.2s' }}>
              <DataExport
                asteroidSize={asteroidSize}
                asteroidSpeed={asteroidSpeed}
                impactAngle={impactAngle}
                calculations={calculations}
              />
            </div>
          </div>
        </div>
      </section>

      {/* NASA Data Integration Section */}
  <section id="nasa-data" ref={nasaRef} className="py-20 px-4 relative overflow-hidden">
        {/* Cosmic mesh background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        
        <div className="max-w-7xl mx-auto scroll-fade-in">
          <NASADataIntegration />
        </div>
      </section>

      <div className="scroll-fade-in">
        <NASADataPanel />
      </div>
      
      <div id="strategies" className="scroll-scale-in">
        <MitigationStrategies />
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-card/20 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-10" />
        
        <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10 scroll-fade-in">
          <h3 className="text-2xl font-bold">
            <span className="gradient-text glow-text">
              Impact Watch Nexus
            </span>
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built for NASA Space Apps Challenge 2025. Empowering planetary defense through 
            data visualization, scientific modeling, and public education.
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground flex-wrap">
            <span className="hover:text-primary transition-colors cursor-default">Data: NASA NEO API & USGS</span>
            <span>•</span>
            <span className="hover:text-primary transition-colors cursor-default">Physics: Keplerian Mechanics</span>
            <span>•</span>
            <span className="hover:text-primary transition-colors cursor-default">Open Source</span>
          </div>
        </div>
      </footer>
      </div>
    </main>
  );
};

export default Index;
