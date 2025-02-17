
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Marker } from '@react-google-maps/api';

interface VehicleMarkersProps {
  map: google.maps.Map | null;
}

export const VehicleMarkers = ({ map }: VehicleMarkersProps) => {
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});

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
    if (!map || !nearbyVehicles) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.setMap(null));
    markersRef.current = {};

    // Add new markers
    nearbyVehicles.forEach((vehicle) => {
      if (!vehicle.profiles?.username && !vehicle.profiles?.license_plate) return;

      const marker = new google.maps.Marker({
        position: { lat: vehicle.latitude, lng: vehicle.longitude },
        map,
        title: vehicle.profiles?.username || 'Unknown User'
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            ${vehicle.profiles?.username ? `<p>User: ${vehicle.profiles.username}</p>` : ''}
            ${vehicle.profiles?.license_plate ? `<p>Plate: ${vehicle.profiles.license_plate}</p>` : ''}
            <p>Last seen: ${new Date(vehicle.last_updated).toLocaleTimeString()}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current[vehicle.user_id] = marker;
    });
  }, [nearbyVehicles, map]);

  return null;
};
