
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VehicleMarkersProps {
  map: mapboxgl.Map | null;
}

export const VehicleMarkers = ({ map }: VehicleMarkersProps) => {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  // Fetch nearby vehicles
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
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Update vehicle markers on the map
  useEffect(() => {
    if (!map || !nearbyVehicles) return;

    // Wait for map to be loaded
    const setupMarkers = () => {
      // Remove old markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      // Add new markers
      nearbyVehicles.forEach((vehicle) => {
        if (!vehicle.profiles?.username && !vehicle.profiles?.license_plate) return;

        try {
          const marker = new mapboxgl.Marker({
            color: '#7c3aed',
            scale: 0.8
          })
            .setLngLat([vehicle.longitude, vehicle.latitude]);

          // Create popup
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(
              `<div class="p-2">
                ${vehicle.profiles?.username ? `<p>User: ${vehicle.profiles.username}</p>` : ''}
                ${vehicle.profiles?.license_plate ? `<p>Plate: ${vehicle.profiles.license_plate}</p>` : ''}
                <p>Last seen: ${new Date(vehicle.last_updated).toLocaleTimeString()}</p>
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
