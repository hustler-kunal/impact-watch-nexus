import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ParameterControlsProps {
  asteroidSize: number;
  setAsteroidSize: (value: number) => void;
  asteroidSpeed: number;
  setAsteroidSpeed: (value: number) => void;
  impactAngle: number;
  setImpactAngle: (value: number) => void;
  asteroidDistance: number;
  setAsteroidDistance: (value: number) => void;
}

const ParameterControls = ({
  asteroidSize,
  setAsteroidSize,
  asteroidSpeed,
  setAsteroidSpeed,
  impactAngle,
  setImpactAngle,
  asteroidDistance,
  setAsteroidDistance,
}: ParameterControlsProps) => {
  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border">
      <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
        <span className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
        Asteroid Parameters
      </h3>

      <TooltipProvider>
        <div className="space-y-6">
          {/* Size Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                Diameter (meters)
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Asteroid diameter affects impact energy and crater size. Typical NEOs range from 10m to 1000m.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <span className="text-sm font-mono text-primary">{asteroidSize.toFixed(1)}m</span>
            </div>
            <Slider
              value={[asteroidSize]}
              onValueChange={(value) => setAsteroidSize(value[0])}
              min={10}
              max={1000}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small (10m)</span>
              <span>Large (1000m)</span>
            </div>
          </div>

          {/* Speed Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                Velocity (km/s)
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Impact velocity significantly affects destructive energy. Earth's escape velocity is 11.2 km/s.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <span className="text-sm font-mono text-primary">{asteroidSpeed.toFixed(1)} km/s</span>
            </div>
            <Slider
              value={[asteroidSpeed]}
              onValueChange={(value) => setAsteroidSpeed(value[0])}
              min={5}
              max={50}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow (5 km/s)</span>
              <span>Fast (50 km/s)</span>
            </div>
          </div>

          {/* Angle Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                Impact Angle (degrees)
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Impact angle affects crater shape and ejecta distribution. 45° is most common for natural impacts.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <span className="text-sm font-mono text-primary">{impactAngle.toFixed(0)}°</span>
            </div>
            <Slider
              value={[impactAngle]}
              onValueChange={(value) => setImpactAngle(value[0])}
              min={15}
              max={90}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Oblique (15°)</span>
              <span>Vertical (90°)</span>
            </div>
          </div>

          {/* Distance Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                Orbital Distance
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Visual distance from Earth in the 3D viewer. Does not affect impact calculations.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <span className="text-sm font-mono text-primary">{asteroidDistance.toFixed(1)}x</span>
            </div>
            <Slider
              value={[asteroidDistance]}
              onValueChange={(value) => setAsteroidDistance(value[0])}
              min={4}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>
      </TooltipProvider>
    </Card>
  );
};

export default ParameterControls;
