import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Orbit, Target, AlertCircle } from "lucide-react";
import { useMemo } from "react";

interface TrajectoryTimelineProps {
  asteroidSpeed: number;
  asteroidDistance: number;
}

const TrajectoryTimeline = ({ asteroidSpeed, asteroidDistance }: TrajectoryTimelineProps) => {
  const timeline = useMemo(() => {
    // Calculate detection to impact timeline (simplified)
    const distanceKm = asteroidDistance * 384400; // Moon distance as reference
    const speedKmPerHour = asteroidSpeed * 3600;
    const hoursToImpact = distanceKm / speedKmPerHour;
    const daysToImpact = hoursToImpact / 24;

    const milestones = [
      {
        phase: "Detection",
        time: `T-${Math.round(daysToImpact)} days`,
        icon: Orbit,
        status: "completed",
        description: "Asteroid first detected by NEO surveillance"
      },
      {
        phase: "Tracking Confirmation",
        time: `T-${Math.round(daysToImpact * 0.9)} days`,
        icon: Target,
        status: "completed",
        description: "Trajectory confirmed, impact probability calculated"
      },
      {
        phase: "Global Alert",
        time: `T-${Math.round(daysToImpact * 0.7)} days`,
        icon: AlertCircle,
        status: "active",
        description: "International agencies notified, deflection window open"
      },
      {
        phase: "Last Deflection Window",
        time: `T-${Math.round(daysToImpact * 0.3)} days`,
        icon: Clock,
        status: "pending",
        description: "Final opportunity for kinetic impactor mission"
      },
      {
        phase: "Impact Event",
        time: "T-0",
        icon: Target,
        status: "critical",
        description: "Projected impact time"
      }
    ];

    return { daysToImpact: Math.round(daysToImpact), milestones };
  }, [asteroidSpeed, asteroidDistance]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "active": return "bg-primary/20 text-primary border-primary/50";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "critical": return "bg-destructive/20 text-destructive border-destructive/50";
      default: return "bg-muted/20 text-muted-foreground border-muted/50";
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Detection Timeline
        </h3>
        <Badge className="bg-destructive/20 text-destructive border-destructive/50 font-semibold">
          {timeline.daysToImpact} Days to Impact
        </Badge>
      </div>

      <div className="space-y-4">
        {timeline.milestones.map((milestone, index) => {
          const Icon = milestone.icon;
          return (
            <div key={index} className="relative">
              {index < timeline.milestones.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-full bg-border" />
              )}
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${getStatusColor(milestone.status)} z-10`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{milestone.phase}</h4>
                    <span className="text-sm font-mono text-muted-foreground">{milestone.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border">
        <div className="p-4 rounded-lg bg-muted/30 border border-muted">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Timeline calculated based on current asteroid parameters. 
            Actual detection and response times depend on observation capabilities and international coordination.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TrajectoryTimeline;
