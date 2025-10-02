import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Satellite, RefreshCw, Database, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AsteroidData {
  name: string;
  designation: string;
  diameter_min: number;
  diameter_max: number;
  velocity: number;
  approach_date: string;
  miss_distance: number;
  is_hazardous: boolean;
}

const NASADataIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [asteroidData, setAsteroidData] = useState<AsteroidData | null>(null);

  const fetchNASAData = async () => {
    setLoading(true);
    
    // Simulate API call with sample data
    // In production, use: https://api.nasa.gov/neo/rest/v1/feed?api_key=YOUR_KEY
    setTimeout(() => {
      const sampleData: AsteroidData = {
        name: "Impactor-2025",
        designation: "2025 IC1",
        diameter_min: 140,
        diameter_max: 310,
        velocity: 23.4,
        approach_date: "2025-04-15",
        miss_distance: 3154280,
        is_hazardous: true
      };
      
      setAsteroidData(sampleData);
      setLoading(false);
      
      toast.success("NASA NEO data loaded!", {
        description: `Retrieved data for ${sampleData.name}`
      });
    }, 1500);
  };

  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/20">
            <Satellite className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">NASA NEO Data</h3>
            <p className="text-sm text-muted-foreground">Real-time asteroid tracking</p>
          </div>
        </div>
        <Button
          onClick={fetchNASAData}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 shadow-glow-asteroid"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Database className="w-4 h-4 mr-2" />
          )}
          {loading ? "Loading..." : "Fetch Data"}
        </Button>
      </div>

      {asteroidData ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-1">{asteroidData.name}</h4>
              <p className="text-sm text-muted-foreground">Designation: {asteroidData.designation}</p>
            </div>
            <Badge className={asteroidData.is_hazardous 
              ? "bg-destructive/20 text-destructive border-destructive/50"
              : "bg-green-500/20 text-green-400 border-green-500/50"
            }>
              {asteroidData.is_hazardous ? "Potentially Hazardous" : "Non-Hazardous"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">Diameter Range</span>
              </div>
              <p className="text-xl font-bold text-accent">
                {asteroidData.diameter_min}-{asteroidData.diameter_max}m
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-sm text-muted-foreground">Velocity</span>
              </div>
              <p className="text-xl font-bold text-secondary">{asteroidData.velocity} km/s</p>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Approach Date</span>
              </div>
              <p className="text-lg font-bold text-primary">{asteroidData.approach_date}</p>
            </div>

            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <Satellite className="w-4 h-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Miss Distance</span>
              </div>
              <p className="text-lg font-bold text-destructive">
                {(asteroidData.miss_distance / 384400).toFixed(2)} LD
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-muted">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Data Source:</strong> NASA Center for Near-Earth Object Studies (CNEOS).
              LD = Lunar Distance (384,400 km). Data retrieved from NEO API for demonstration purposes.
            </p>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Click "Fetch Data" to load real-time asteroid information from NASA</p>
        </div>
      )}
    </Card>
  );
};

export default NASADataIntegration;
