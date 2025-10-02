import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Zap, Sun, Rocket, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Strategy {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  effectiveness: number;
  timeRequired: string;
  technology: string;
  color: string;
}

const strategies: Strategy[] = [
  {
    id: "kinetic",
    name: "Kinetic Impactor",
    icon: Target,
    description: "Crash a spacecraft into the asteroid to change its velocity and trajectory.",
    effectiveness: 85,
    timeRequired: "5-10 years",
    technology: "Current (DART mission tested 2022)",
    color: "text-primary"
  },
  {
    id: "gravity",
    name: "Gravity Tractor",
    icon: Rocket,
    description: "Use spacecraft's gravitational pull to slowly alter asteroid's path.",
    effectiveness: 70,
    timeRequired: "10-20 years",
    technology: "Current (theoretical)",
    color: "text-secondary"
  },
  {
    id: "nuclear",
    name: "Nuclear Deflection",
    icon: Zap,
    description: "Detonate nuclear device near asteroid to vaporize surface material and create thrust.",
    effectiveness: 95,
    timeRequired: "3-8 years",
    technology: "Advanced (under development)",
    color: "text-accent"
  },
  {
    id: "laser",
    name: "Laser Ablation",
    icon: Sun,
    description: "Use powerful lasers to vaporize asteroid surface, creating propulsive effect.",
    effectiveness: 75,
    timeRequired: "8-15 years",
    technology: "Future (conceptual)",
    color: "text-destructive"
  },
  {
    id: "capture",
    name: "Mass Driver",
    icon: Shield,
    description: "Install electromagnetic catapult on asteroid to eject material and change momentum.",
    effectiveness: 80,
    timeRequired: "15-25 years",
    technology: "Future (conceptual)",
    color: "text-foreground"
  }
];

const MitigationStrategies = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const handleStrategySelect = (strategy: Strategy) => {
    setSelectedStrategy(strategy.id);
    toast.success(`${strategy.name} selected!`, {
      description: `Effectiveness: ${strategy.effectiveness}% | Time: ${strategy.timeRequired}`
    });
  };

  return (
    <section id="mitigation" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/50">
            Planetary Defense
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Mitigation <span className="text-primary">Strategies</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore proven and theoretical methods to deflect potentially hazardous asteroids
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy, index) => {
            const Icon = strategy.icon;
            const isSelected = selectedStrategy === strategy.id;
            
            return (
              <Card 
                key={strategy.id}
                className={`p-6 space-y-4 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group ${
                  isSelected ? 'border-primary shadow-glow-orbit' : ''
                }`}
                onClick={() => handleStrategySelect(strategy)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-card group-hover:shadow-glow-asteroid transition-all ${strategy.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {strategy.effectiveness}% effective
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {strategy.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {strategy.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time Required:</span>
                    <span className="font-semibold text-foreground">{strategy.timeRequired}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Technology:</span>
                    <span className="font-semibold text-foreground">{strategy.technology}</span>
                  </div>
                </div>

                <Button 
                  variant={isSelected ? "default" : "outline"}
                  className="w-full group-hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStrategySelect(strategy);
                  }}
                >
                  {isSelected ? 'Selected' : 'Simulate Strategy'}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-border">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Real-World Example: DART Mission
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            NASA's Double Asteroid Redirection Test (DART) successfully demonstrated the kinetic impactor 
            technique in September 2022 by impacting asteroid Dimorphos, changing its orbital period by 33 minutes. 
            This proved that we can successfully deflect an asteroid if given enough warning time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MitigationStrategies;
