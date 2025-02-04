
import { Camera, CameraResultType, CameraDirection } from '@capacitor/camera';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Camera as CameraIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ScanScreen = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const { toast } = useToast();

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        direction: CameraDirection.Back
      });

      setPhoto(image.dataUrl || null);
      
      toast({
        title: "Photo captured",
        description: "Your photo has been captured successfully.",
      });
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "There was an error accessing the camera. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-12rem)]">
      <Card className="p-4 h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-white/20">
        {photo ? (
          <div className="space-y-4 w-full flex flex-col items-center">
            <img 
              src={photo} 
              alt="Captured" 
              className="w-full max-w-md rounded-lg shadow-lg"
            />
            <Button 
              onClick={() => setPhoto(null)}
              variant="outline"
            >
              Take Another Photo
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <Button 
              onClick={takePicture}
              size="lg"
              className="gap-2"
            >
              <CameraIcon className="w-5 h-5" />
              Take Photo
            </Button>
            <p className="text-sm text-gray-500">
              Click to access your device's camera
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ScanScreen;
