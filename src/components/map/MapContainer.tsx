
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
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const { toast } = useToast();
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const isInitialized = useRef(false);

  const toggleMapStyle = () => {
    if (!map.current || !isMapReady) return;
    
    const newStyle = isSatelliteView
      ? 'mapbox://styles/mapbox/streets-v12'
      : 'mapbox://styles/mapbox/satellite-v9';
    
    map.current.setStyle(newStyle);
    setIsSatelliteView(!isSatelliteView);
  };

  const addLocationMarker = (longitude: number, latitude: number) => {
    if (!map.current) return;

    if (locationMarker.current) {
      locationMarker.current.remove();
    }

    try {
      locationMarker.current = new mapboxgl.Marker({
        color: '#7c3aed',
        scale: 0.8,
        draggable: false
      })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })
        .setLngLat([longitude, latitude])
        .setHTML('<div class="text-sm font-medium">Your location</div>')
        .addTo(map.current);
    } catch (error) {
      console.error('Error adding location marker:', error);
      toast({
        title: "Error",
        description: "Failed to add location marker to the map.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current || isInitialized.current) return;

      try {
        // Get Mapbox token from Supabase
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
        
        if (tokenError || !tokenData?.token) {
          console.error('Failed to get Mapbox token:', tokenError);
          throw new Error('Failed to get Mapbox token');
        }

        mapboxgl.accessToken = tokenData.token;
        console.log('Mapbox token retrieved successfully');

        // Default map location
        const defaultLocation = {
          longitude: -74.5,
          latitude: 40,
          zoom: 9
        };

        // Create map instance
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [defaultLocation.longitude, defaultLocation.latitude],
          zoom: defaultLocation.zoom,
          cooperativeGestures: true
        });

        // Add navigation control
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Wait for map to load
        mapInstance.on('load', () => {
          console.log('Map loaded successfully');
          map.current = mapInstance;
          setIsMapReady(true);
          isInitialized.current = true;
          onMapInitialized(mapInstance);

          // Get user location after map is loaded
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                mapInstance.flyTo({
                  center: [longitude, latitude],
                  zoom: 14,
                  essential: true
                });
                addLocationMarker(longitude, latitude);
              },
              (error) => {
                console.error('Geolocation error:', error);
                toast({
                  title: "Location Access Denied",
                  description: "Using default map location. Please enable location access for better experience.",
                  variant: "destructive"
                });
              }
            );
          }
        });

        // Handle map errors
        mapInstance.on('error', (e) => {
          console.error('Map error:', e);
          toast({
            title: "Map Error",
            description: "There was an error loading the map. Please try refreshing the page.",
            variant: "destructive"
          });
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: "Map Error",
          description: "Failed to initialize the map. Please try again later.",
          variant: "destructive"
        });
      }
    };

    initializeMap();

    return () => {
      if (locationMarker.current) {
        locationMarker.current.remove();
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
        setIsMapReady(false);
        isInitialized.current = false;
      }
    };
  }, [onMapInitialized]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-16 left-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="bg-white hover:bg-gray-100"
          onClick={toggleMapStyle}
          disabled={!isMapReady}
        >
          {isSatelliteView ? <MapIcon /> : <Satellite />}
        </Button>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10" />
    </div>
  );
};
