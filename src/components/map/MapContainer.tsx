
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map as MapIcon, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MapContainerProps {
  onMapInitialized: (map: mapboxgl.Map) => void;
}

export const MapContainer = ({ onMapInitialized }: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const mapInitializedRef = useRef(false);

  const toggleMapStyle = () => {
    if (!map.current) return;
    
    const newStyle = isSatelliteView
      ? 'mapbox://styles/mapbox/streets-v12'
      : 'mapbox://styles/mapbox/satellite-v9';
    
    map.current.setStyle(newStyle);
    setIsSatelliteView(!isSatelliteView);
  };

  useEffect(() => {
    if (mapInitializedRef.current || !mapContainer.current) return;
    mapInitializedRef.current = true;

    const initializeMap = async () => {
      try {
        console.log('Fetching Mapbox token...');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
          method: 'POST',
        });
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          toast({
            title: "Error Loading Map",
            description: "Failed to initialize the map. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        if (!data?.token) {
          console.error('No token received from server');
          toast({
            title: "Error Loading Map",
            description: "Map configuration is incomplete. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        console.log('Token received successfully');
        mapboxgl.accessToken = data.token;
        console.log('Initializing map...');

        // Get user's location
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              
              if (!mapContainer.current) return;
              
              map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [longitude, latitude],
                zoom: 14,
                pitch: 0,
                bearing: 0
              });

              // Add navigation controls
              const navControl = new mapboxgl.NavigationControl({
                visualizePitch: true,
              });
              map.current.addControl(navControl, 'top-right');

              console.log('Map initialized successfully at user location');
              map.current.once('load', () => {
                console.log('Map loaded successfully');
                onMapInitialized(map.current!);
              });
            },
            (error) => {
              console.error('Error getting location:', error);
              initializeDefaultMap(data.token);
            }
          );
        } else {
          console.log('Geolocation not supported, using default location');
          initializeDefaultMap(data.token);
        }

      } catch (error) {
        console.error('Error in map initialization:', error);
        toast({
          title: "Map Error",
          description: "An error occurred while setting up the map.",
          variant: "destructive",
        });
      }
    };

    const initializeDefaultMap = (token: string) => {
      if (!mapContainer.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [30, 15],
        zoom: 2,
        pitch: 0,
        bearing: 0
      });

      // Add navigation controls
      const navControl = new mapboxgl.NavigationControl({
        visualizePitch: true,
      });
      map.current.addControl(navControl, 'top-right');

      console.log('Map initialized with default location');
      map.current.once('load', () => {
        console.log('Map loaded successfully');
        onMapInitialized(map.current!);
      });
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
      mapInitializedRef.current = false;
    };
  }, [onMapInitialized]);

  return (
    <div className="relative w-full h-[70vh]">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="bg-white hover:bg-gray-100"
          onClick={toggleMapStyle}
        >
          {isSatelliteView ? <MapIcon /> : <Satellite />}
        </Button>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10" />
    </div>
  );
};
