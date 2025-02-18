
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

    // Remove existing marker if it exists
    if (locationMarker.current) {
      locationMarker.current.remove();
    }

    try {
      // Create a new marker
      locationMarker.current = new mapboxgl.Marker({
        color: '#7c3aed',
        scale: 0.8,
        draggable: false
      })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Add a popup
      new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })
        .setLngLat([longitude, latitude])
        .setHTML('<div class="text-sm font-medium">Your location</div>')
        .addTo(map.current);

      toast({
        title: "Location Updated",
        description: "Your current location has been marked on the map.",
      });
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
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !data?.token) {
          throw new Error('Failed to get Mapbox token');
        }

        mapboxgl.accessToken = data.token;
        
        const createMap = (longitude: number, latitude: number, zoom: number) => {
          if (!mapContainer.current) return;
          
          const mapInstance = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [longitude, latitude],
            zoom,
            pitch: 0,
            bearing: 0
          });

          map.current = mapInstance;

          // Add navigation controls
          const navControl = new mapboxgl.NavigationControl({
            visualizePitch: true,
          });
          mapInstance.addControl(navControl, 'top-right');

          mapInstance.once('load', () => {
            // Add location marker after map is loaded and fly to location
            addLocationMarker(longitude, latitude);
            mapInstance.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              essential: true
            });
            
            setIsMapReady(true);
            isInitialized.current = true;
            onMapInitialized(mapInstance);
          });

          return mapInstance;
        };

        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              createMap(longitude, latitude, 14);
            },
            (error) => {
              console.error('Geolocation error:', error);
              toast({
                title: "Location Access Denied",
                description: "Using default map location. Please enable location access for better experience.",
                variant: "destructive"
              });
              createMap(30, 15, 2);
            }
          );
        } else {
          createMap(30, 15, 2);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: "Map Error",
          description: "Failed to initialize the map. Please try again later.",
          variant: "destructive",
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
