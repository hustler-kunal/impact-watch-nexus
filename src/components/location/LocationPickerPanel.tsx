import { useState } from 'react';
import ImpactLocationSelector from '@/components/ImpactLocationSelector';
import GooglePlacesLocationPicker from './GooglePlacesLocationPicker';
import { Card } from '@/components/ui/card';
// Globe & OSM search removed per request – only Google picker remains

interface LocationPickerPanelProps {
  onChange: (lat: number, lon: number, label?: string) => void;
}

// Minimal in-browser geocoding using OpenStreetMap (optional; no key). Fallback if blocked.
async function geocode(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      const best = data[0];
      return { lat: parseFloat(best.lat), lon: parseFloat(best.lon), name: best.display_name };
    }
  } catch (e) {
    // ignore; return null
  }
  return null;
}

export const LocationPickerPanel = ({ onChange }: LocationPickerPanelProps) => {
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });

  const handlePreset = (lat: number, lon: number, label: string) => {
    setCoords({ lat, lon });
    onChange(lat, lon, label);
  };

  // OSM geocode removed – Google Places used instead

  return (
    <div className="space-y-6">
      <ImpactLocationSelector onLocationSelect={handlePreset} />
      <GooglePlacesLocationPicker onChange={(lat, lon, label)=> handlePreset(lat, lon, label || 'Google Place')} />
      <Card className="p-3 text-[11px] bg-card/40 border-dashed border-border">
        Using Google Maps & Places for location search and precise coordinate selection.
      </Card>
    </div>
  );
};

export default LocationPickerPanel;