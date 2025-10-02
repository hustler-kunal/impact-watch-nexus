import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, Mountain, Waves } from "lucide-react";
import { useMemo } from "react";

interface ImpactCalculatorProps {
  asteroidSize: number;
  asteroidSpeed: number;
  impactAngle: number;
}

const ImpactCalculator = ({ asteroidSize, asteroidSpeed, impactAngle }: ImpactCalculatorProps) => {
  const calculations = useMemo(() => {
    // Asteroid parameters
    const diameter = asteroidSize; // meters
    const velocity = asteroidSpeed * 1000; // convert km/s to m/s
    const density = 3000; // kg/m³ (typical for rocky asteroid)
    const angle = impactAngle;

    // Calculate mass
    const radius = diameter / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * density;

    // Calculate kinetic energy (Joules)
    const kineticEnergy = 0.5 * mass * Math.pow(velocity, 2);
    
    // Convert to megatons of TNT (1 megaton = 4.184 × 10^15 J)
    const megatonsTNT = kineticEnergy / (4.184 * Math.pow(10, 15));

    // Crater diameter estimation (simplified scaling law)
    // D = 1.8 * (E^0.29) for E in megatons
    const craterDiameter = 1.8 * Math.pow(megatonsTNT, 0.29) * 1000; // meters

    // Richter scale equivalent (approximate)
    const richterScale = 0.67 * Math.log10(kineticEnergy) - 5.87;

    // Angle effect factor
    const angleEfficiency = Math.sin(angle * Math.PI / 180);

    // Tsunami potential (if water impact)
    const tsunamiPotential = diameter > 100 ? "HIGH" : diameter > 50 ? "MODERATE" : "LOW";

    // Danger level
    let dangerLevel: "MINIMAL" | "MODERATE" | "SEVERE" | "CATASTROPHIC";
    if (megatonsTNT < 1) dangerLevel = "MINIMAL";
    else if (megatonsTNT < 100) dangerLevel = "MODERATE";
    else if (megatonsTNT < 1000) dangerLevel = "SEVERE";
    else dangerLevel = "CATASTROPHIC";

    return {
      mass: (mass / 1000).toFixed(2), // tons
      energy: kineticEnergy.toExponential(2),
      megatonsTNT: megatonsTNT.toFixed(2),
      craterDiameter: craterDiameter.toFixed(0),
      richterScale: richterScale.toFixed(1),
      angleEfficiency: (angleEfficiency * 100).toFixed(0),
      tsunamiPotential,
      dangerLevel
    };
  }, [asteroidSize, asteroidSpeed, impactAngle]);

  const getDangerColor = (level: string) => {
    switch (level) {
      case "MINIMAL": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "MODERATE": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "SEVERE": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "CATASTROPHIC": return "bg-destructive/20 text-destructive border-destructive/50";
      default: return "bg-primary/20 text-primary border-primary/50";
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Impact Analysis
        </h3>
        <Badge className={`${getDangerColor(calculations.dangerLevel)} font-semibold`}>
          {calculations.dangerLevel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Energy Output */}
        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 hover:border-accent/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Impact Energy</p>
              <p className="text-2xl font-bold text-accent">{calculations.megatonsTNT}</p>
              <p className="text-xs text-muted-foreground mt-1">Megatons TNT</p>
            </div>
          </div>
        </div>

        {/* Crater Size */}
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 hover:border-destructive/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <Mountain className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Crater Diameter</p>
              <p className="text-2xl font-bold text-destructive">{calculations.craterDiameter}</p>
              <p className="text-xs text-muted-foreground mt-1">Meters</p>
            </div>
          </div>
        </div>

        {/* Seismic Effect */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Seismic Magnitude</p>
              <p className="text-2xl font-bold text-primary">{calculations.richterScale}</p>
              <p className="text-xs text-muted-foreground mt-1">Richter Scale</p>
            </div>
          </div>
        </div>

        {/* Tsunami Potential */}
        <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20 hover:border-secondary/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Waves className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tsunami Risk</p>
              <p className="text-2xl font-bold text-secondary">{calculations.tsunamiPotential}</p>
              <p className="text-xs text-muted-foreground mt-1">Ocean Impact</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="pt-4 border-t border-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Asteroid Mass:</span>
          <span className="font-mono text-foreground">{calculations.mass} tons</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Kinetic Energy:</span>
          <span className="font-mono text-foreground">{calculations.energy} J</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Impact Efficiency:</span>
          <span className="font-mono text-foreground">{calculations.angleEfficiency}%</span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/30 border border-muted">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong> Calculations use simplified physics models. 
          Actual impact effects depend on many factors including impact location, atmospheric entry, and local geology.
        </p>
      </div>
    </Card>
  );
};

export default ImpactCalculator;
