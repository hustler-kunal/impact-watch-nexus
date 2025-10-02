import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Orbit, Calculator, Globe2, Telescope, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Telescope,
    title: "Real NASA Data",
    description: "Access live data from NASA's Near-Earth Object API with 32,000+ tracked asteroids and real orbital parameters.",
    color: "text-primary"
  },
  {
    icon: Orbit,
    title: "3D Trajectory Simulation",
    description: "Visualize asteroid orbits and trajectories using accurate Keplerian orbital mechanics in an interactive 3D environment.",
    color: "text-secondary"
  },
  {
    icon: Calculator,
    title: "Impact Calculations",
    description: "Calculate kinetic energy, crater size, seismic magnitude, and tsunami potential using physics-based models.",
    color: "text-accent"
  },
  {
    icon: Globe2,
    title: "USGS Integration",
    description: "Leverage USGS geological data for realistic environmental impact modeling including elevation and seismic zones.",
    color: "text-destructive"
  },
  {
    icon: Database,
    title: "Comprehensive Database",
    description: "Query asteroid characteristics including size, velocity, composition, and close-approach dates.",
    color: "text-primary"
  },
  {
    icon: TrendingUp,
    title: "Deflection Modeling",
    description: "Simulate various mitigation strategies including kinetic impactors, gravity tractors, and nuclear deflection.",
    color: "text-secondary"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-background to-card/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/50">
            Powerful Capabilities
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="text-primary">Understand</span> Impact Risks
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Combining scientific accuracy with intuitive visualization to make asteroid threats accessible to everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 space-y-4 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-glow-orbit animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-3 rounded-lg bg-card w-fit group-hover:shadow-glow-asteroid transition-all ${feature.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
