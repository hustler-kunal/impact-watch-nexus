import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Satellite, ExternalLink, Database, Calendar } from "lucide-react";
import { toast } from "sonner";

const NASADataPanel = () => {
  const handleFetchData = () => {
    toast.info("Connecting to NASA NEO API...", {
      description: "In production, this would fetch real-time asteroid data"
    });
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Info Section */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Satellite className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <Badge className="mb-2 bg-primary/20 text-primary border-primary/50">
                    NASA Open Data
                  </Badge>
                  <h2 className="text-3xl font-bold">
                    Near-Earth Object <span className="text-primary">Database</span>
                  </h2>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed text-lg">
                Access real-time data from NASA's Center for Near-Earth Object Studies (CNEOS). 
                Query orbital elements, physical characteristics, and close-approach information 
                for thousands of asteroids and comets.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-muted">
                  <Database className="w-5 h-5 text-primary mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">32,000+</div>
                  <div className="text-sm text-muted-foreground">Tracked Objects</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-muted">
                  <Calendar className="w-5 h-5 text-primary mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">Live</div>
                  <div className="text-sm text-muted-foreground">Real-Time Updates</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleFetchData}
                  className="bg-primary hover:bg-primary/90 shadow-glow-asteroid"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Fetch NEO Data
                </Button>
                <Button 
                  variant="outline"
                  className="border-primary/50 hover:border-primary"
                  onClick={() => window.open('https://api.nasa.gov/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  NASA API Docs
                </Button>
              </div>
            </div>

            {/* Sample Data Display */}
            <div className="flex-1 w-full">
              <div className="p-6 rounded-lg bg-background/50 border border-border font-mono text-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-primary font-semibold">Sample NEO Data</span>
                  <Badge variant="outline" className="text-xs">JSON</Badge>
                </div>
                <pre className="text-muted-foreground overflow-x-auto">
{`{
  "name": "Impactor-2025",
  "designation": "2025 IC1",
  "diameter": {
    "min": 140,
    "max": 310,
    "estimated": 225
  },
  "velocity": {
    "kmps": 23.4,
    "mph": 52358
  },
  "approach_date": "2025-04-15",
  "miss_distance": {
    "lunar": 8.2,
    "km": 3154280
  },
  "is_hazardous": true
}`}
                </pre>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default NASADataPanel;
