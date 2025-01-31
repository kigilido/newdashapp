import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Navigation2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const MapScreen = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!map.current || !searchQuery) return;

    try {
      const { data: { token } } = await supabase.functions.invoke('get-mapbox-token');
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${token}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        map.current.flyTo({
          center: [lng, lat],
          zoom: 12,
          duration: 2000,
          essential: true
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleMyLocation = () => {
    if (!map.current) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 2000,
            essential: true
          });

          // Add a marker for the user's location
          new mapboxgl.Marker({
            color: '#7c3aed', // Purple marker to match theme
            scale: 0.8
          })
            .setLngLat([longitude, latitude])
            .addTo(map.current);

          toast({
            title: "Location Found",
            description: "Map centered on your current location",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please check your permissions.",
            variant: "destructive",
          });
          console.error('Error getting location:', error);
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Fetch Mapbox token from Supabase
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        
        if (!mapContainer.current) return;
        
        // Initialize map with token
        mapboxgl.accessToken = data.token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          // Change the style here to any of the available styles
          style: 'mapbox://styles/mapbox/satellite-streets-v12', // Changed from light-v11 to satellite-streets
          projection: 'globe',
          zoom: 1.5,
          center: [30, 15],
          pitch: 45,
        });

        // Add navigation controls
        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        // Disable scroll zoom for smoother experience
        map.current.scrollZoom.disable();

        // Add atmosphere and fog effects
        map.current.on('style.load', () => {
          map.current?.setFog({
            color: 'rgb(255, 255, 255)',
            'high-color': 'rgb(200, 200, 225)',
            'horizon-blend': 0.2,
          });
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

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Location</h1>
      
      <div className="flex gap-2">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" 
            onClick={handleSearch}
          />
        </div>
        
        {/* My Location Button */}
        <Button
          variant="outline"
          className="gap-2 bg-white hover:bg-violet-50"
          onClick={handleMyLocation}
        >
          <Navigation2 className="w-4 h-4" />
          My Location
        </Button>
      </div>

      <Card className="w-full overflow-hidden">
        <div className="relative w-full h-[70vh]">
          <div ref={mapContainer} className="absolute inset-0" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10" />
        </div>
      </Card>
    </div>
  );
};

export default MapScreen;