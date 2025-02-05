
import { Camera, CameraResultType, CameraDirection, CameraSource } from '@capacitor/camera';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Camera as CameraIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ScanScreen = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkPermissions = async () => {
    try {
      const permission = await Camera.checkPermissions();
      if (permission.camera !== 'granted') {
        await Camera.requestPermissions();
      }
    } catch (error) {
      console.error('Permission error:', error);
      toast({
        title: "Permission Error",
        description: "Unable to access camera. Please check your permissions.",
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
        .single();

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

      // Create new conversation
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

      // Add both users as participants
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

  const processLicensePlate = async (licensePlate: string) => {
    setIsProcessing(true);
    try {
      const profile = await findUserByLicensePlate(licensePlate);
      
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

      // Navigate to chat with the new conversation
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

  const takePicture = async () => {
    try {
      await checkPermissions();

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear
      });

      if (image.dataUrl) {
        setPhoto(image.dataUrl);
        // TODO: Replace with actual OCR/license plate recognition
        // For now, we'll use a mock license plate for testing
        const mockLicensePlate = "ABC123";
        await processLicensePlate(mockLicensePlate);
      }
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
              disabled={isProcessing}
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
              disabled={isProcessing}
            >
              <CameraIcon className="w-5 h-5" />
              {isProcessing ? "Processing..." : "Take Photo"}
            </Button>
            <p className="text-sm text-gray-500">
              Scan a vehicle's license plate to start a chat
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ScanScreen;
