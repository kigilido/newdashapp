
import { useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { useToast } from "@/components/ui/use-toast";

export const useLocationPermission = () => {
  const { toast } = useToast();

  const checkLocationPermission = async () => {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      
      if (permissionStatus.location === 'denied' || permissionStatus.location === 'prompt') {
        const request = await Geolocation.requestPermissions();
        
        if (request.location === 'granted') {
          toast({
            title: "Location Access Granted",
            description: "You can now share your location in chats",
          });
        } else {
          toast({
            title: "Location Access Required",
            description: "Please enable location access in your device settings to use location features",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      toast({
        title: "Permission Error",
        description: "Unable to check location permissions. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { checkLocationPermission };
};
