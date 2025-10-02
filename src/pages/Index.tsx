import { useState } from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AsteroidViewer from "@/components/AsteroidViewer";
import ParameterControls from "@/components/ParameterControls";
import ImpactCalculator from "@/components/ImpactCalculator";
import MitigationStrategies from "@/components/MitigationStrategies";
import NASADataPanel from "@/components/NASADataPanel";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [asteroidSize, setAsteroidSize] = useState(200);
  const [asteroidSpeed, setAsteroidSpeed] = useState(20);
  const [impactAngle, setImpactAngle] = useState(45);
  const [asteroidDistance, setAsteroidDistance] = useState(6);

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Features />

      {/* Simulator Section */}
      <section id="simulator" className="py-20 px-4 bg-gradient-to-b from-card/20 to-background">
        <div className="max-w-7xl mx-auto">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Controls */}
            <div className="lg:col-span-1 space-y-6">
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
            </div>

            {/* Right: Visualization and Results */}
            <div className="lg:col-span-2 space-y-6">
              <AsteroidViewer
                asteroidSize={asteroidSize / 100}
                asteroidSpeed={asteroidSpeed / 10}
                asteroidDistance={asteroidDistance}
              />
              <ImpactCalculator
                asteroidSize={asteroidSize}
                asteroidSpeed={asteroidSpeed}
                impactAngle={impactAngle}
              />
            </div>
          </div>
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
