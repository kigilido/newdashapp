
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
  const mapInitializationAttempts = useRef(0);
  const MAX_INITIALIZATION_ATTEMPTS = 3;

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

    try {
      // Remove existing marker if it exists
      if (locationMarker.current) {
        locationMarker.current.remove();
      }

      // Create and add new marker
      locationMarker.current = new mapboxgl.Marker({
        color: '#7c3aed',
        scale: 0.8,
        draggable: false
      })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Create and add popup
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25
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

  const handleGeolocation = useCallback(() => {
    if (!map.current) return;

    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = async () => {
      // Prevent multiple initialization attempts
      if (!mapContainer.current || isInitialized.current) return;

      // Check initialization attempts
      if (mapInitializationAttempts.current >= MAX_INITIALIZATION_ATTEMPTS) {
        console.error('Max map initialization attempts reached');
        toast({
          title: "Map Error",
          description: "Failed to initialize map after multiple attempts. Please refresh the page.",
          variant: "destructive"
        });
        return;
      }

      mapInitializationAttempts.current += 1;

      try {
        // Clear the map container to prevent interactivity warnings
        if (mapContainer.current) {
          mapContainer.current.innerHTML = '';
        }

        const { data: { token }, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !token || !isMounted) {
          throw new Error(error?.message || 'Failed to get Mapbox token');
        }

        mapboxgl.accessToken = token;

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-74.5, 40],
          zoom: 9,
          cooperativeGestures: false,
          scrollZoom: true,
          preserveDrawingBuffer: true,
          attributionControl: false,
          failIfMajorPerformanceCaveat: true
        });

        // Add attribution control in a better position
        mapInstance.addControl(new mapboxgl.AttributionControl(), 'bottom-left');

        // Add navigation controls with all features enabled
        mapInstance.addControl(
          new mapboxgl.NavigationControl({
            showCompass: true,
            showZoom: true,
            visualizePitch: true
          }),
          'top-right'
        );

        // Wait for map to load
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Map load timeout'));
          }, 10000); // 10 second timeout

          mapInstance.once('load', () => {
            clearTimeout(timeoutId);
            resolve(true);
          });

          mapInstance.once('error', (e) => {
            clearTimeout(timeoutId);
            reject(e.error);
          });
        });

        if (!isMounted) return;

        console.log('Map loaded successfully');
        map.current = mapInstance;
        setIsMapReady(true);
        isInitialized.current = true;
        onMapInitialized(mapInstance);

        // Try to get user location
        if ('geolocation' in navigator) {
          try {
            const { latitude, longitude } = await handleGeolocation();
            mapInstance.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              essential: true
            });
            addLocationMarker(longitude, latitude);
          } catch (error) {
            console.warn('Geolocation error:', error);
            toast({
              title: "Location Access Denied",
              description: "Using default map location. Please enable location access for better experience.",
              variant: "destructive"
            });
          }
        }

      } catch (error) {
        console.error('Error initializing map:', error);
        
        if (isMounted) {
          toast({
            title: "Map Error",
            description: `Failed to initialize map: ${error.message}`,
            variant: "destructive"
          });

          // Clean up failed initialization
          if (map.current) {
            map.current.remove();
            map.current = null;
          }
          setIsMapReady(false);
          isInitialized.current = false;

          // Retry initialization after a delay
          setTimeout(initializeMap, 2000);
        }
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
