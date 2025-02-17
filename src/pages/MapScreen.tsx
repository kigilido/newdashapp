
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapContainer } from '@/components/map/MapContainer';
import { LocationSearch } from '@/components/map/LocationSearch';
import { VehicleMarkers } from '@/components/map/VehicleMarkers';
import mapboxgl from 'mapbox-gl';

const MapScreen = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const updateUserLocation = async (latitude: number, longitude: number) => {
    try {
      const { error } = await supabase
        .from('vehicle_locations')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          latitude,
          longitude,
          last_updated: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleSearch = async () => {
    if (!map || !searchQuery) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        map.flyTo({
          center: [lng, lat],
          zoom: 12
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleMapInitialized = (initializedMap: mapboxgl.Map) => {
    setMap(initializedMap);
  };

  const handleMyLocation = () => {
    if (!map) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          map.flyTo({
            center: [longitude, latitude],
            zoom: 14
          });

          await updateUserLocation(latitude, longitude);

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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-4">Location</h1>
      
      <div className="relative flex-1">
        <Card className="w-full h-full overflow-hidden">
          <MapContainer onMapInitialized={handleMapInitialized} />
          <VehicleMarkers map={map} />
          <div className="absolute inset-x-0 top-4 z-10 px-4 pr-16">
            <LocationSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
          <button
            onClick={handleMyLocation}
            className="absolute right-4 bottom-[6.25rem] z-10 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <span className="lucide-navigation-2 text-[#3A86FF]" />
          </button>
          <style>{`
            .lucide-navigation-2 {
              width: 20px;
              height: 20px;
              display: inline-block;
              background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%233A86FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 7 19-7-4-7 4 7-19z"/></svg>');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
            }
          `}</style>
        </Card>
      </div>
    </div>
  );
};

export default MapScreen;
