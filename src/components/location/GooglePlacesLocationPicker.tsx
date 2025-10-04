import { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Extremely thin ambient declarations (avoid heavy dependency) – only what we touch
interface GMapsLatLngLiteral { lat: number; lng: number }
interface GMapsMapOptions { center: GMapsLatLngLiteral; zoom: number; mapTypeControl?: boolean; streetViewControl?: boolean; fullscreenControl?: boolean }
interface GMapsEvent { latLng: { lat(): number; lng(): number } }
interface GMapsMap { panTo(pos: GMapsLatLngLiteral): void; setZoom(z: number): void; addListener(evt: string, cb: (e: GMapsEvent) => void): void; getCenter(): { lat(): number; lng(): number } }
interface GMapsMarker { setPosition(p: GMapsLatLngLiteral): void }
interface GMapsAutocomplete { addListener(evt: string, cb: () => void): void; getPlace(): { geometry?: { location: { lat(): number; lng(): number } }; formatted_address?: string; name?: string } | undefined }
interface GoogleMapsAPI { maps: { Map: new (el: HTMLElement, opts: GMapsMapOptions) => GMapsMap; Marker: new (opts: { map: GMapsMap; position: GMapsLatLngLiteral }) => GMapsMarker; places: { Autocomplete: new (input: HTMLInputElement, opts?: Record<string, unknown>) => GMapsAutocomplete } } }
declare global { interface Window { google?: GoogleMapsAPI } }

interface GooglePlacesLocationPickerProps {
  onChange: (lat: number, lon: number, label?: string) => void;
  height?: number;
  defaultCenter?: { lat: number; lon: number };
}

const scriptId = 'google-maps-script';

function loadGoogle(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve();
    if (document.getElementById(scriptId)) {
      const existing = document.getElementById(scriptId) as HTMLScriptElement;
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject('Google Maps failed to load'));
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.onload = () => resolve();
    script.onerror = () => reject('Google Maps failed to load');
    document.head.appendChild(script);
  });
}

export const GooglePlacesLocationPicker = ({ onChange, height = 320, defaultCenter = { lat: 20, lon: 0 } }: GooglePlacesLocationPickerProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const markerRef = useRef<GMapsMarker | null>(null);
  const mapInstanceRef = useRef<GMapsMap | null>(null);
  const autocompleteRef = useRef<GMapsAutocomplete | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLocation = useCallback((lat: number, lon: number, label?: string) => {
    if (markerRef.current) markerRef.current.setPosition({ lat, lng: lon });
    onChange(lat, lon, label);
  }, [onChange]);

  useEffect(() => {
    if (!apiKey) {
      setError('Missing Google Maps API key (VITE_GOOGLE_MAPS_API_KEY)');
      return;
    }
    setLoading(true);
    loadGoogle(apiKey)
      .then(() => {
        if (!mapRef.current) return;
        mapInstanceRef.current = new window.google!.maps.Map(mapRef.current, {
          center: { lat: defaultCenter.lat, lng: defaultCenter.lon },
          zoom: 3,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        const c = mapInstanceRef.current.getCenter();
        markerRef.current = new window.google!.maps.Marker({ map: mapInstanceRef.current, position: { lat: c.lat(), lng: c.lng() } });
        mapInstanceRef.current.addListener('click', (e: GMapsEvent) => {
          updateLocation(e.latLng.lat(), e.latLng.lng(), 'Custom');
        });
        if (inputRef.current) {
          autocompleteRef.current = new window.google!.maps.places.Autocomplete(inputRef.current, { types: ['geocode'] });
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current!.getPlace();
            if (!place || !place.geometry) {
              toast.error('Place details unavailable');
              return;
            }
            const lat = place.geometry.location.lat();
            const lon = place.geometry.location.lng();
            updateLocation(lat, lon, place.formatted_address || place.name);
            mapInstanceRef.current.panTo({ lat, lng: lon });
            mapInstanceRef.current.setZoom(6);
          });
        }
        setLoading(false);
      })
      .catch(err => {
        setError(typeof err === 'string' ? err : 'Failed to init Google Maps');
        setLoading(false);
      });
  }, [apiKey, defaultCenter.lat, defaultCenter.lon, updateLocation]);

  const recenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: defaultCenter.lat, lng: defaultCenter.lon });
      mapInstanceRef.current.setZoom(3);
    }
  };

  return (
    <Card className="p-4 space-y-3 bg-card/50 border-border">
      <h4 className="font-semibold text-sm">Google Location Picker</h4>
      {error && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 p-2 rounded">{error}</div>}
      <div className="flex gap-2 items-center">
        <Input ref={inputRef} placeholder="Search places..." disabled={loading || !!error} />
        <Button type="button" variant="outline" onClick={recenter} disabled={loading || !!error}>Reset</Button>
      </div>
      <div ref={mapRef} style={{ height, width: '100%', borderRadius: '0.5rem' }} className="overflow-hidden border border-border bg-background" />
      <p className="text-[10px] text-muted-foreground">Data © Google • Uses Places Autocomplete & Map click to set impact site.</p>
    </Card>
  );
};

export default GooglePlacesLocationPicker;