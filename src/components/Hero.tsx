import { Rocket, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      
      const scrolled = window.scrollY;
      const parallaxSpeed = 0.5;
      
      // Parallax effect on background layers
      const bgLayers = heroRef.current.querySelectorAll('.parallax-layer');
      bgLayers.forEach((layer, index) => {
        const speed = (index + 1) * 0.3;
        (layer as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
      });
      
      // Fade out content as you scroll
      const content = heroRef.current.querySelector('.hero-content');
      if (content) {
        const opacity = 1 - (scrolled / (window.innerHeight * 0.8));
        (content as HTMLElement).style.opacity = Math.max(0, opacity).toString();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToSimulator = () => {
    document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20 parallax-section">
      {/* Animated background layers with parallax */}
      <div className="absolute inset-0 bg-gradient-space opacity-95 parallax-layer" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--orbit))_0%,transparent_50%)] opacity-30 animate-pulse-glow parallax-layer" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--asteroid))_0%,transparent_60%)] opacity-20 animate-pulse-glow parallax-layer" style={{ animationDelay: '2s' }} />
      
      {/* Animated grid overlay with parallax */}
      <div className="absolute inset-0 opacity-10 parallax-layer" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      
      {/* Floating particles with depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? 'hsl(var(--secondary))' : 'hsl(var(--accent))',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0.4 + Math.random() * 0.4
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8 animate-fade-in hero-content">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm text-muted-foreground mb-4 hover-lift">
          <Rocket className="w-4 h-4 text-primary animate-pulse" />
          <span>NASA Space Apps Challenge 2025</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-in">
          <span className="gradient-text glow-text">
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
            className="group relative bg-primary hover:bg-primary/90 text-primary-foreground hover-lift glow-border overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <Shield className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Launch Simulator
            </span>
            <div className="absolute inset-0 -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="glass-card glass-hover border-primary/50 hover:border-primary group"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Globe className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
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
              className="glass-card glass-hover rounded-xl p-6 hover-lift group animate-fade-in"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <div className="relative">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
