
import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapContainer } from '@/components/map/MapContainer';
import { LocationSearch } from '@/components/map/LocationSearch';
import { VehicleMarkers } from '@/components/map/VehicleMarkers';

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
      const { data: { token } } = await supabase.functions.invoke('get-mapbox-token');
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${token}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        map.flyTo({
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

  const handleMapInitialized = (initializedMap: mapboxgl.Map) => {
    setMap(initializedMap);

    // Add custom location control
    const locationControlContainer = document.createElement('div');
    locationControlContainer.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    const locationButton = document.createElement('button');
    locationButton.className = 'custom-map-control';
    locationButton.innerHTML = '<span class="lucide-navigation-2"></span>';
    locationButton.addEventListener('click', handleMyLocation);
    locationControlContainer.appendChild(locationButton);
    initializedMap.addControl({
      onAdd: () => locationControlContainer,
      onRemove: () => {
        locationControlContainer.parentNode?.removeChild(locationControlContainer);
      }
    }, 'top-right');
  };

  const handleMyLocation = () => {
    if (!map) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          map.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 2000,
            essential: true
          });

          // Update user's location in the database
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Location</h1>
      
      <LocationSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      <Card className="w-full overflow-hidden">
        <MapContainer onMapInitialized={handleMapInitialized} />
        <VehicleMarkers map={map} />
        <style>{`
          .custom-map-control {
            width: 29px;
            height: 29px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            background: white;
          }
          .custom-map-control:hover {
            background: #f3f4f6;
          }
          .lucide-navigation-2 {
            width: 16px;
            height: 16px;
            display: inline-block;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 7 19-7-4-7 4 7-19z"/></svg>');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
          }
        `}</style>
      </Card>
    </div>
  );
};

export default MapScreen;
