import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const GooglePlacesLocationPicker = ({ onChange, height = 320, defaultCenter = { lat: 20, lon: 0 } }: GooglePlacesLocationPickerProps) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([defaultCenter.lat, defaultCenter.lon]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const handleLocationChange = (lat: number, lon: number, label?: string) => {
    setMarkerPosition([lat, lon]);
    onChange(lat, lon, label || 'Custom Location');
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 6);
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
    if (mapRef.current) {
      mapRef.current.flyTo([defaultCenter.lat, defaultCenter.lon], 3);
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
      <div style={{ height, width: '100%', borderRadius: '0.5rem' }} className="overflow-hidden border border-border">
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lon]}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={markerPosition} />
          <MapClickHandler onLocationChange={handleLocationChange} />
        </MapContainer>
      </div>
      <p className="text-[10px] text-muted-foreground">Data © OpenStreetMap • Free and open source mapping. Click map to set location.</p>
    </Card>
  );
};

export default GooglePlacesLocationPicker;