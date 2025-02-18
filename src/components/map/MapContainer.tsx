
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map as MapIcon, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

interface MapContainerProps {
  onMapInitialized: (map: mapboxgl.Map) => void;
}

export const MapContainer = ({ onMapInitialized }: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapboxToken, setMapboxToken] = useState(() => {
    const token = localStorage.getItem('mapbox_token');
    return token || '';
  });

  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    localStorage.setItem('mapbox_token', token);
    toast({
      title: "Success",
      description: "Mapbox token has been set successfully",
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: isSatelliteView ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/light-v11',
        projection: 'globe',
        zoom: 1.5,
        center: [30, 15],
        pitch: 45,
        fadeDuration: 0,
        localFontFamily: "'Satoshi', sans-serif",
      });

      map.current = newMap;

      const setupMap = () => {
        if (!newMap) return;

        newMap.setFog({
          color: 'rgb(255, 255, 255)',
          'high-color': 'rgb(200, 200, 225)',
          'horizon-blend': 0.2,
        });

        setIsMapReady(true);
        onMapInitialized(newMap);
      };

      newMap.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      newMap.scrollZoom.disable();

      if (newMap.loaded()) {
        setupMap();
      } else {
        newMap.once('load', setupMap);
      }

      return () => {
        newMap.remove();
        map.current = null;
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Error",
        description: "Failed to initialize map. Please check your Mapbox token.",
        variant: "destructive"
      });
      localStorage.removeItem('mapbox_token');
      setMapboxToken('');
    }
  }, [mapboxToken, onMapInitialized]);

  // Handle style changes
  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap || !isMapReady) return;

    const style = isSatelliteView 
      ? 'mapbox://styles/mapbox/satellite-v9'
      : 'mapbox://styles/mapbox/light-v11';

    if (currentMap.getStyle().sprite !== style) {
      currentMap.setStyle(style, { diff: false });
    }
  }, [isSatelliteView, isMapReady]);

  return (
    <div className="relative w-full h-full">
      {!mapboxToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Enter Mapbox Token</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input');
                if (input && input.value) {
                  handleTokenSubmit(input.value);
                }
              }}
              className="space-y-2"
            >
              <Input
                type="text"
                placeholder="Enter your Mapbox public token..."
                className="mb-2"
              />
              <Button type="submit" className="w-full">
                Set Token
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-2">
              Visit <a href="https://www.mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mapbox.com</a> to get your public token
            </p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-16 left-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="bg-white hover:bg-gray-100"
          onClick={() => setIsSatelliteView(!isSatelliteView)}
          disabled={!isMapReady}
        >
          {isSatelliteView ? <MapIcon /> : <Satellite />}
        </Button>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10" />
    </div>
  );
};
