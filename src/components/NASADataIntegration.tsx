import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Satellite, RefreshCw, Database, TrendingUp } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { getJson } from "@/lib/http";

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

interface RawAsteroid {
  name: string;
  id: string;
  designation?: string;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: { kilometers_per_second: string };
    miss_distance: { kilometers: string };
  }>;
  estimated_diameter: { meters: { estimated_diameter_min: number; estimated_diameter_max: number } };
}

const NASADataIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [asteroidData, setAsteroidData] = useState<AsteroidData | null>(null);
  const [asteroidList, setAsteroidList] = useState<AsteroidData[]>([]);

  const NASA_API_KEY = "tOCSNFleT5BEIgLEuju9Ei7N3WFOTPs9PyDpbYfQ";
  const lastFetchedKeyRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNASAData = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      // Get today's date and 7 days from now
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 7);

      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const cacheKey = `${startDateStr}:${endDateStr}`;
      if (lastFetchedKeyRef.current === cacheKey && asteroidList.length > 0) {
        setLoading(false);
        return; // avoid redundant fetch
      }

      const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDateStr}&end_date=${endDateStr}&api_key=${NASA_API_KEY}`;
      interface FeedResponse { near_earth_objects: Record<string, RawAsteroid[]> }
      const data: FeedResponse = await getJson(url, {}, { retries: 2, backoffMs: 700, cacheKey: `neo:${cacheKey}`, cacheTtlMs: 5 * 60_000 });

      // Flatten all asteroids from all dates
      const allAsteroids: RawAsteroid[] = Object.values(data.near_earth_objects).flat();

      // Sort by closest approach date
      allAsteroids.sort((a, b) => {
        const da = new Date(a.close_approach_data[0].close_approach_date).getTime();
        const db = new Date(b.close_approach_data[0].close_approach_date).getTime();
        return da - db;
      });

      // Convert to display-friendly format
      const asteroidList: AsteroidData[] = allAsteroids.map(a => {
        const closeApproach = a.close_approach_data[0];
        const diameter = a.estimated_diameter.meters;
        return {
          name: a.name,
          designation: a.designation || a.id,
          diameter_min: Math.round(diameter.estimated_diameter_min),
          diameter_max: Math.round(diameter.estimated_diameter_max),
          velocity: parseFloat(closeApproach.relative_velocity.kilometers_per_second),
          approach_date: closeApproach.close_approach_date,
          miss_distance: parseFloat(closeApproach.miss_distance.kilometers),
          is_hazardous: a.is_potentially_hazardous_asteroid,
        };
      });

      if (asteroidList.length > 0) {
        setAsteroidList(asteroidList);
        setAsteroidData(asteroidList[0]); // display first asteroid for now
        toast.success(`Loaded ${asteroidList.length} asteroids from NASA`);
        lastFetchedKeyRef.current = cacheKey;
      } else {
        toast.error("No asteroid data available for this period");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching NASA data:", error);
      setLoading(false);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to fetch NASA data", { description: "Check API key or try again later" });
    }
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

      <div className="flex flex-wrap gap-2 text-xs">
        {error && (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/40">Error</Badge>
        )}
        {loading && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/40 animate-pulse">Loading</Badge>
        )}
        {asteroidData && !loading && !error && (
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/40">Live</Badge>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-xs text-destructive leading-relaxed">
          {error}
        </div>
      )}

      {asteroidList.length > 0 && !loading && !error ? (
        <div className="space-y-4">
          {asteroidList.map((asteroid) => (
            <div key={asteroid.designation} className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-1">{asteroid.name}</h4>
                  <p className="text-sm text-muted-foreground">Designation: {asteroid.designation}</p>
                </div>
                <Badge className={asteroid.is_hazardous 
                  ? "bg-destructive/20 text-destructive border-destructive/50"
                  : "bg-green-500/20 text-green-400 border-green-500/50"
                }>
                  {asteroid.is_hazardous ? "Potentially Hazardous" : "Non-Hazardous"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-sm text-muted-foreground">Diameter Range</span>
                  </div>
                  <p className="text-xl font-bold text-accent">{asteroid.diameter_min}-{asteroid.diameter_max}m</p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-muted-foreground">Velocity</span>
                  </div>
                  <p className="text-xl font-bold text-secondary">{asteroid.velocity} km/s</p>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Approach Date</span>
                  </div>
                  <p className="text-lg font-bold text-primary">{asteroid.approach_date}</p>
                </div>

                <div className="p-4 rounded-lg bg-destructive/
