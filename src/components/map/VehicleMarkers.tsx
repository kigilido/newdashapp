
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import mapboxgl from 'mapbox-gl';

interface VehicleMarkersProps {
  map: mapboxgl.Map | null;
}

export const VehicleMarkers = ({ map }: VehicleMarkersProps) => {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  const { data: nearbyVehicles } = useQuery({
    queryKey: ['nearby-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_locations')
        .select('*, profiles(username, license_plate)')
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    // Wait for both map and data to be available
    if (!map || !nearbyVehicles) return;

    // Ensure map is loaded before adding markers
    if (!map.loaded()) {
      map.once('load', () => {
        updateMarkers();
      });
      return;
    }

    updateMarkers();

    function updateMarkers() {
      try {
        // Remove old markers
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};

        // Add new markers
        nearbyVehicles.forEach((vehicle) => {
          if (!vehicle.profiles?.username && !vehicle.profiles?.license_plate) return;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              ${vehicle.profiles?.username ? `<p>User: ${vehicle.profiles.username}</p>` : ''}
              ${vehicle.profiles?.license_plate ? `<p>Plate: ${vehicle.profiles.license_plate}</p>` : ''}
              <p>Last seen: ${new Date(vehicle.last_updated).toLocaleTimeString()}</p>
            </div>
          `);

          try {
            const marker = new mapboxgl.Marker()
              .setLngLat([vehicle.longitude, vehicle.latitude])
              .setPopup(popup)
              .addTo(map);

            markersRef.current[vehicle.user_id] = marker;
          } catch (error) {
            console.error('Error adding marker:', error);
          }
        });
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    }

    // Cleanup function
    return () => {
      Object.values(markersRef.current).forEach(marker => {
        try {
          marker.remove();
        } catch (error) {
          console.error('Error removing marker:', error);
        }
      });
      markersRef.current = {};
    };
  }, [nearbyVehicles, map]);

  return null;
};
