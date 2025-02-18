
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface VehicleMarkersProps {
  map: mapboxgl.Map | null;
}

export const VehicleMarkers = ({ map }: VehicleMarkersProps) => {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { toast } = useToast();

  // Fetch nearby vehicles
  const { data: nearbyVehicles, error } = useQuery({
    queryKey: ['nearby-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_locations')
        .select('*, profiles(username, license_plate)')
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error fetching vehicle locations:', error);
        throw error;
      }
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: 3, // Retry failed requests up to 3 times
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      console.error('Vehicle locations query error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vehicle locations. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Update vehicle markers on the map
  useEffect(() => {
    if (!map || !nearbyVehicles) return;

    const setupMarkers = () => {
      // Remove old markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      // Add new markers
      nearbyVehicles.forEach((vehicle) => {
        if (!vehicle.longitude || !vehicle.latitude) {
          console.warn('Vehicle missing coordinates:', vehicle);
          return;
        }

        try {
          const marker = new mapboxgl.Marker({
            color: '#7c3aed',
            scale: 0.8
          })
            .setLngLat([vehicle.longitude, vehicle.latitude]);

          // Create popup with vehicle info
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(
              `<div class="p-2">
                ${vehicle.profiles?.username ? `<p class="font-medium">User: ${vehicle.profiles.username}</p>` : ''}
                ${vehicle.profiles?.license_plate ? `<p class="text-sm text-muted-foreground">Plate: ${vehicle.profiles.license_plate}</p>` : ''}
                <p class="text-xs text-muted-foreground mt-1">Last seen: ${new Date(vehicle.last_updated).toLocaleTimeString()}</p>
              </div>`
            );

          // Only add marker and popup if map is loaded
          if (map.loaded()) {
            marker.setPopup(popup).addTo(map);
            markersRef.current[vehicle.user_id] = marker;
          }
        } catch (error) {
          console.error('Error adding marker:', error);
        }
      });
    };

    if (map.loaded()) {
      setupMarkers();
    } else {
      map.once('load', setupMarkers);
    }

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
    };
  }, [nearbyVehicles, map]);

  return null;
};
