import { useState, useMemo } from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AsteroidViewer from "@/components/AsteroidViewer";
import ParameterControls from "@/components/ParameterControls";
import ImpactCalculator from "@/components/ImpactCalculator";
import MitigationStrategies from "@/components/MitigationStrategies";
import NASADataPanel from "@/components/NASADataPanel";
import ImpactLocationSelector from "@/components/ImpactLocationSelector";
import TrajectoryTimeline from "@/components/TrajectoryTimeline";
import NASADataIntegration from "@/components/NASADataIntegration";
import DataExport from "@/components/DataExport";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [asteroidSize, setAsteroidSize] = useState(200);
  const [asteroidSpeed, setAsteroidSpeed] = useState(20);
  const [impactAngle, setImpactAngle] = useState(45);
  const [asteroidDistance, setAsteroidDistance] = useState(6);
  const [impactLocation, setImpactLocation] = useState({ lat: 0, lon: -140, name: "Pacific Ocean" });

  const handleLocationSelect = (lat: number, lon: number, location: string) => {
    setImpactLocation({ lat, lon, name: location });
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

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Features />

      {/* Simulator Section */}
      <section id="simulator" className="py-20 px-4 bg-gradient-to-b from-card/20 to-background">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent/20 text-accent border-accent/50">
              Interactive Simulator
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Asteroid Impact <span className="text-primary">Simulator</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Adjust parameters to visualize different impact scenarios and analyze potential consequences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - 3D Viewer & Location */}
            <div className="space-y-6">
              <AsteroidViewer
                asteroidSize={asteroidSize / 100}
                asteroidSpeed={asteroidSpeed / 10}
                asteroidDistance={asteroidDistance}
              />
              <ImpactLocationSelector onLocationSelect={handleLocationSelect} />
            </div>

            {/* Right Column - Controls & Calculations */}
            <div className="space-y-6">
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
            </div>
          </div>

          {/* Additional Analysis Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <TrajectoryTimeline 
              asteroidSpeed={asteroidSpeed}
              asteroidDistance={asteroidDistance}
            />
            <DataExport
              asteroidSize={asteroidSize}
              asteroidSpeed={asteroidSpeed}
              impactAngle={impactAngle}
              calculations={calculations}
            />
          </div>
        </div>
      </section>

      {/* NASA Data Integration Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <NASADataIntegration />
        </div>
      </section>

      <NASADataPanel />
      <MitigationStrategies />

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-card/20">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h3 className="text-2xl font-bold">
            <span className="bg-gradient-cosmic bg-clip-text text-transparent">
              Impact Watch Nexus
            </span>
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built for NASA Space Apps Challenge 2025. Empowering planetary defense through 
            data visualization, scientific modeling, and public education.
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>Data: NASA NEO API & USGS</span>
            <span>•</span>
            <span>Physics: Keplerian Mechanics</span>
            <span>•</span>
            <span>Open Source</span>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
