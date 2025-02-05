
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CameraButtonProps {
  onClick: () => void;
  isProcessing: boolean;
  hasPermission: boolean | null;
}

export const CameraButton = ({ onClick, isProcessing, hasPermission }: CameraButtonProps) => {
  return (
    <div className="space-y-4 text-center">
      <Button 
        onClick={onClick}
        size="lg"
        className="gap-2"
        disabled={isProcessing}
      >
        <Camera className="w-5 h-5" />
        {hasPermission === false ? "Enable Camera" : isProcessing ? "Processing..." : "Take Photo"}
      </Button>
      {hasPermission === false && (
        <p className="text-sm text-red-500">
          Camera access is required. Please enable it in your browser settings.
        </p>
      )}
      <p className="text-sm text-gray-500">
        Scan a vehicle's license plate to start a chat
      </p>
    </div>
  );
};
