import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Leaflet + Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface GooglePlacesLocationPickerProps {
  onChange: (lat: number, lon: number, label?: string) => void;
  height?: number;
  defaultCenter?: { lat: number; lon: number };
}

// Geocoding using OpenStreetMap Nominatim
async function geocodeLocation(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      const best = data[0];
      return { lat: parseFloat(best.lat), lon: parseFloat(best.lon), name: best.display_name };
    }
  } catch (e) {
    toast.error('Failed to search location');
  }
  return null;
}

export const GooglePlacesLocationPicker = ({ onChange, height = 320, defaultCenter = { lat: 20, lon: 0 } }: GooglePlacesLocationPickerProps) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([defaultCenter.lat, defaultCenter.lon]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current).setView([defaultCenter.lat, defaultCenter.lon], 3);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker
    const marker = L.marker([defaultCenter.lat, defaultCenter.lon]).addTo(map);
    markerRef.current = marker;

    // Handle map clicks
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      marker.setLatLng([lat, lng]);
      onChange(lat, lng, 'Custom Location');
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleLocationChange = (lat: number, lon: number, label?: string) => {
    setMarkerPosition([lat, lon]);
    onChange(lat, lon, label || 'Custom Location');
    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo([lat, lon], 6);
      markerRef.current.setLatLng([lat, lon]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a location to search');
      return;
    }
    setSearching(true);
    const result = await geocodeLocation(searchQuery);
    setSearching(false);
    if (result) {
      handleLocationChange(result.lat, result.lon, result.name);
      toast.success('Location found!');
    } else {
      toast.error('Location not found');
    }
  };

  const handleReset = () => {
    setMarkerPosition([defaultCenter.lat, defaultCenter.lon]);
    onChange(defaultCenter.lat, defaultCenter.lon, 'Reset');
    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo([defaultCenter.lat, defaultCenter.lon], 3);
      markerRef.current.setLatLng([defaultCenter.lat, defaultCenter.lon]);
    }
  };

  return (
    <Card className="p-4 space-y-3 bg-card/50 border-border">
      <h4 className="font-semibold text-sm">Location Picker</h4>
      <div className="flex gap-2 items-center">
        <Input 
          placeholder="Search places..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={searching}
        />
        <Button type="button" variant="outline" onClick={handleSearch} disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
      </div>
      <div 
        ref={containerRef}
        style={{ height, width: '100%', borderRadius: '0.5rem' }} 
        className="overflow-hidden border border-border"
      />
      <p className="text-[10px] text-muted-foreground">Data © OpenStreetMap • Free and open source mapping. Click map to set location.</p>
    </Card>
  );
};

export default GooglePlacesLocationPicker;