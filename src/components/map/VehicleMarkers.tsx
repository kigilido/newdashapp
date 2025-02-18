
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

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    nearbyVehicles.forEach((vehicle) => {
      if (!vehicle.profiles?.username && !vehicle.profiles?.license_plate) return;

      const marker = new mapboxgl.Marker({
        color: '#7c3aed',
        scale: 0.8
      })
        .setLngLat([vehicle.longitude, vehicle.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(
              `<div class="p-2">
                ${vehicle.profiles?.username ? `<p>User: ${vehicle.profiles.username}</p>` : ''}
                ${vehicle.profiles?.license_plate ? `<p>Plate: ${vehicle.profiles.license_plate}</p>` : ''}
                <p>Last seen: ${new Date(vehicle.last_updated).toLocaleTimeString()}</p>
              </div>`
            )
        )
        .addTo(map);

      markersRef.current[vehicle.user_id] = marker;
    });
  }, [nearbyVehicles, map]);

  return null;
};
