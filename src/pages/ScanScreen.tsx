
import { Camera, CameraResultType, CameraDirection, CameraSource } from '@capacitor/camera';
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CameraPermissionHandler } from "@/components/camera/CameraPermissionHandler";
import { PhotoPreview } from "@/components/camera/PhotoPreview";
import { CameraButton } from "@/components/camera/CameraButton";

const ScanScreen = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [detectedPlate, setDetectedPlate] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const requestPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
      }
      const permission = await Camera.requestPermissions();
      setHasPermission(permission.camera === 'granted');
    } catch (error) {
      console.error('Permission request error:', error);
      toast({
        title: "Permission Error",
        description: "Please enable camera access in your browser settings to use this feature.",
        variant: "destructive",
      });
    }
  };

  const findUserByLicensePlate = async (licensePlate: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('license_plate', licensePlate)
        .maybeSingle();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  };

  const createConversation = async (targetUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert([{
          type: 'direct',
          title: `Vehicle Chat`,
          creator_id: user.id
        }])
        .select()
        .single();

      if (convError) throw convError;

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: user.id },
          { conversation_id: conversation.id, user_id: targetUserId }
        ]);

      if (partError) throw partError;

      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const handleConfirmPlate = async () => {
    if (!detectedPlate) return;
    
    setIsProcessing(true);
    try {
      const profile = await findUserByLicensePlate(detectedPlate);
      
      if (!profile) {
        toast({
          title: "Vehicle Not Found",
          description: "No registered user found with this license plate.",
          variant: "destructive",
        });
        return;
      }

      const conversationId = await createConversation(profile.id);
      
      toast({
        title: "Success",
        description: "Vehicle found! Starting chat...",
      });

      navigate(`/app/chat?conversation=${conversationId}`);

    } catch (error) {
      console.error('Error processing license plate:', error);
      toast({
        title: "Error",
        description: "Failed to process license plate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const performOCR = async (imageDataUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-license-plate', {
        body: { image: imageDataUrl }
      });

      if (error) throw error;
      
      if (!data.licensePlate) {
        throw new Error('Failed to process image');
      }

      setRawText(data.rawText);
      return data.licensePlate;
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const takePicture = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear
      });

      if (!image.dataUrl) {
        throw new Error('No image data received from camera');
      }

      setPhoto(image.dataUrl);
      setIsProcessing(true);
      setDetectedPlate(null);
      setRawText(null);
      
      try {
        const licensePlate = await performOCR(image.dataUrl);
        
        if (licensePlate === 'NO_PLATE_FOUND') {
          toast({
            title: "No License Plate Found",
            description: "Please take another photo where the license plate is clearly visible.",
            variant: "destructive",
          });
          setPhoto(null);
        } else {
          setDetectedPlate(licensePlate);
        }
      } catch (error) {
        console.error('OCR processing error:', error);
        setPhoto(null);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "There was an error accessing the camera. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setDetectedPlate(null);
    setRawText(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-12rem)]">
      <CameraPermissionHandler 
        hasPermission={hasPermission}
        setHasPermission={setHasPermission}
      />
      <Card className="p-4 h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-white/20">
        {photo ? (
          <PhotoPreview 
            photoUrl={photo}
            onRetake={handleRetake}
            isProcessing={isProcessing}
            licensePlate={detectedPlate}
            onConfirm={handleConfirmPlate}
            rawText={rawText}
          />
        ) : (
          <CameraButton 
            onClick={takePicture}
            isProcessing={isProcessing}
            hasPermission={hasPermission}
          />
        )}
      </Card>
    </div>
  );
};

export default ScanScreen;
