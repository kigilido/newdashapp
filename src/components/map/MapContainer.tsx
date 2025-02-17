
import { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Map as MapIcon, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface MapContainerProps {
  onMapInitialized: (map: google.maps.Map) => void;
}

// Create a single loader configuration object
const loaderOptions = {
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
  id: 'google-map-script'
};

export const MapContainer = ({ onMapInitialized }: MapContainerProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { toast } = useToast();
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const { isLoaded } = useJsApiLoader(loaderOptions);

  const toggleMapStyle = () => {
    if (!mapRef.current || !isMapReady) return;
    
    mapRef.current.setMapTypeId(isSatelliteView ? 'roadmap' : 'satellite');
    setIsSatelliteView(!isSatelliteView);
  };

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapReady(true);
    onMapInitialized(map);
  };

  const onUnmount = () => {
    mapRef.current = null;
    setIsMapReady(false);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerClassName="absolute inset-0"
        center={{ lat: 15, lng: 30 }}
        zoom={2}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      />
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
