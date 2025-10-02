import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImpactLocationSelectorProps {
  onLocationSelect: (lat: number, lon: number, location: string) => void;
}

const presetLocations = [
  { name: "Pacific Ocean", lat: 0, lon: -140, type: "ocean" },
  { name: "Atlantic Ocean", lat: 30, lon: -40, type: "ocean" },
  { name: "Sahara Desert", lat: 23, lon: 10, type: "land" },
  { name: "Amazon Rainforest", lat: -3, lon: -60, type: "land" },
  { name: "Himalayas", lat: 28, lon: 84, type: "mountain" },
  { name: "Great Plains, USA", lat: 40, lon: -100, type: "land" },
];

const ImpactLocationSelector = ({ onLocationSelect }: ImpactLocationSelectorProps) => {
  const [selectedLocation, setSelectedLocation] = useState(presetLocations[0]);

  const handleLocationSelect = (location: typeof presetLocations[0]) => {
    setSelectedLocation(location);
    onLocationSelect(location.lat, location.lon, location.name);
    toast.success(`Impact location set: ${location.name}`, {
      description: `Coordinates: ${location.lat}°N, ${location.lon}°E`
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ocean": return "bg-secondary/20 text-secondary border-secondary/50";
      case "land": return "bg-accent/20 text-accent border-accent/50";
      case "mountain": return "bg-destructive/20 text-destructive border-destructive/50";
      default: return "bg-primary/20 text-primary border-primary/50";
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Impact Location
        </h3>
        <Badge className="bg-primary/20 text-primary border-primary/50">
          {selectedLocation.name}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presetLocations.map((location) => {
          const isSelected = selectedLocation.name === location.name;
          return (
            <Button
              key={location.name}
              variant={isSelected ? "default" : "outline"}
              className={`h-auto py-4 flex-col gap-2 ${
                isSelected ? "bg-primary shadow-glow-asteroid" : "hover:border-primary/50"
              }`}
              onClick={() => handleLocationSelect(location)}
            >
              <Globe2 className="w-5 h-5" />
              <span className="text-sm font-semibold">{location.name}</span>
              <Badge variant="outline" className={`text-xs ${getTypeColor(location.type)}`}>
                {location.type}
              </Badge>
            </Button>
          );
        })}
      </div>

      <div className="p-4 rounded-lg bg-muted/30 border border-muted">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="text-foreground font-semibold">Impact Location Effects:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• <strong>Ocean:</strong> High tsunami risk, wider devastation radius</li>
              <li>• <strong>Land:</strong> Direct crater, localized seismic effects</li>
              <li>• <strong>Mountain:</strong> Reduced crater depth, debris ejection</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Latitude:</span>
          <span className="font-mono text-foreground">{selectedLocation.lat}°</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Longitude:</span>
          <span className="font-mono text-foreground">{selectedLocation.lon}°</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Terrain Type:</span>
          <span className="font-mono text-foreground capitalize">{selectedLocation.type}</span>
        </div>
      </div>
    </Card>
  );
};

export default ImpactLocationSelector;
