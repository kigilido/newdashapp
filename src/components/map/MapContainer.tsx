
import { useEffect, useRef, useState, useCallback } from 'react';
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

  const toggleMapStyle = useCallback(() => {
    if (!map.current || !isMapReady) return;
    
    const newStyle = isSatelliteView
      ? 'mapbox://styles/mapbox/streets-v12'
      : 'mapbox://styles/mapbox/satellite-v9';
    
    map.current.setStyle(newStyle);
    setIsSatelliteView(!isSatelliteView);
  }, [isSatelliteView, isMapReady]);

  const addLocationMarker = useCallback((longitude: number, latitude: number) => {
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

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })
        .setLngLat([longitude, latitude])
        .setHTML('<div class="text-sm font-medium">Your location</div>')
        .addTo(map.current);

      locationMarker.current.setPopup(popup);
    } catch (error) {
      console.error('Error adding location marker:', error);
      toast({
        title: "Error",
        description: "Failed to add location marker to the map.",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = async () => {
      if (!mapContainer.current || isInitialized.current) return;

      try {
        const { data: { token }, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !token || !isMounted) {
          console.error('Failed to get Mapbox token:', error);
          toast({
            title: "Map Error",
            description: "Failed to initialize map. Please check your Mapbox configuration.",
            variant: "destructive"
          });
          return;
        }

        mapboxgl.accessToken = token;

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-74.5, 40],
          zoom: 9,
          cooperativeGestures: true,
          preserveDrawingBuffer: true
        });

        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        mapInstance.once('load', () => {
          if (!isMounted) return;
          
          console.log('Map loaded successfully');
          map.current = mapInstance;
          setIsMapReady(true);
          isInitialized.current = true;
          onMapInitialized(mapInstance);

          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                if (!isMounted) return;
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
                if (!isMounted) return;
                toast({
                  title: "Location Access Denied",
                  description: "Using default map location. Please enable location access for better experience.",
                  variant: "destructive"
                });
              }
            );
          }
        });

        mapInstance.on('error', (e) => {
          if (!isMounted) return;
          console.error('Map error:', e);
          toast({
            title: "Map Error",
            description: "There was an error loading the map. Please try refreshing the page.",
            variant: "destructive"
          });
        });

      } catch (error) {
        if (!isMounted) return;
        console.error('Error initializing map:', error);
        toast({
          title: "Map Error",
          description: "Failed to initialize map. Please try again later.",
          variant: "destructive"
        });
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
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
  }, []); // Empty dependency array since we're using refs and cleanup

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
    </div>
  );
};
