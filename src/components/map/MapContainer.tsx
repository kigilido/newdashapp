
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MapContainerProps {
  onMapInitialized: (map: mapboxgl.Map) => void;
}

export const MapContainer = ({ onMapInitialized }: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeMap = async () => {
      try {
        console.log('Fetching Mapbox token...');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          toast({
            title: "Error Loading Map",
            description: "Failed to initialize the map. Please try again later.",
            variant: "destructive",
          });
          throw error;
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
        
        if (!mapContainer.current) {
          console.error('Map container not found');
          return;
        }
        
        mapboxgl.accessToken = data.token;
        console.log('Initializing map...');
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          projection: 'globe',
          zoom: 1.5,
          center: [30, 15],
          pitch: 45,
        });

        // Add navigation controls
        const navControl = new mapboxgl.NavigationControl({
          visualizePitch: true,
        });
        map.current.addControl(navControl, 'top-right');

        // Disable scroll zoom for smoother experience
        map.current.scrollZoom.disable();

        // Add atmosphere and fog effects
        map.current.on('style.load', () => {
          map.current?.setFog({
            color: 'rgb(255, 255, 255)',
            'high-color': 'rgb(200, 200, 225)',
            'horizon-blend': 0.2,
          });
          console.log('Map style loaded successfully');
        });

        // Rotation animation settings
        const secondsPerRevolution = 240;
        const maxSpinZoom = 5;
        const slowSpinZoom = 3;
        let userInteracting = false;
        let spinEnabled = true;

        // Spin globe function
        function spinGlobe() {
          if (!map.current) return;
          
          const zoom = map.current.getZoom();
          if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
            let distancePerSecond = 360 / secondsPerRevolution;
            if (zoom > slowSpinZoom) {
              const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
              distancePerSecond *= zoomDif;
            }
            const center = map.current.getCenter();
            center.lng -= distancePerSecond;
            map.current.easeTo({ center, duration: 1000, easing: (n) => n });
          }
        }

        // Event listeners for interaction
        map.current.on('mousedown', () => {
          userInteracting = true;
        });
        
        map.current.on('dragstart', () => {
          userInteracting = true;
        });
        
        map.current.on('mouseup', () => {
          userInteracting = false;
          spinGlobe();
        });
        
        map.current.on('touchend', () => {
          userInteracting = false;
          spinGlobe();
        });

        map.current.on('moveend', () => {
          spinGlobe();
        });

        // Start the globe spinning
        spinGlobe();

        console.log('Map initialized successfully');
        // Notify parent component that map is initialized
        onMapInitialized(map.current);

      } catch (error) {
        console.error('Error in map initialization:', error);
        toast({
          title: "Map Error",
          description: "An error occurred while setting up the map.",
          variant: "destructive",
        });
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, [onMapInitialized]);

  return (
    <div className="relative w-full h-[70vh]">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10" />
    </div>
  );
};
