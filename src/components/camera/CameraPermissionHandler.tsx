
import { Camera } from '@capacitor/camera';
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

interface CameraPermissionHandlerProps {
  hasPermission: boolean | null;
  setHasPermission: (value: boolean) => void;
}

export const CameraPermissionHandler = ({ 
  hasPermission, 
  setHasPermission 
}: CameraPermissionHandlerProps) => {
  const { toast } = useToast();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const permission = await Camera.checkPermissions();
      setHasPermission(permission.camera === 'granted');
      
      if (permission.camera !== 'granted') {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setHasPermission(true);
          } catch (err) {
            console.error('Permission error:', err);
            setHasPermission(false);
          }
        }
        
        try {
          const newPermission = await Camera.requestPermissions();
          setHasPermission(newPermission.camera === 'granted');
        } catch (err) {
          console.error('Capacitor permission error:', err);
          setHasPermission(false);
        }
      }
    } catch (error) {
      console.error('Permission check error:', error);
      setHasPermission(false);
      toast({
        title: "Permission Error",
        description: "Unable to access camera. Please check your permissions in your browser settings.",
        variant: "destructive",
      });
    }
  };

  return null;
};
