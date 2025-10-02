import { Rocket, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const scrollToSimulator = () => {
    document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-space opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--orbit))_0%,transparent_50%)] opacity-20 animate-pulse-glow" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border border-primary/30 rounded-full text-sm text-muted-foreground mb-4">
          <Rocket className="w-4 h-4 text-primary" />
          <span>NASA Space Apps Challenge 2025</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="bg-gradient-cosmic bg-clip-text text-transparent">
            Impact Watch Nexus
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Interactive visualization and simulation tool for asteroid impact scenarios. 
          Predict consequences and evaluate mitigation strategies using real NASA and USGS data.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button 
            size="lg" 
            onClick={scrollToSimulator}
            className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-asteroid hover:shadow-glow-impact transition-all duration-300"
          >
            <Shield className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Launch Simulator
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary/50 hover:border-primary hover:bg-primary/10"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Globe className="w-5 h-5 mr-2" />
            Explore Features
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto">
          {[
            { label: "Known NEOs", value: "32,000+", icon: Rocket },
            { label: "Data Sources", value: "NASA & USGS", icon: Globe },
            { label: "Mitigation Strategies", value: "5+", icon: Shield }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="bg-card/40 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-orbit"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
