
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PhotoPreviewProps {
  photoUrl: string;
  onRetake: () => void;
  isProcessing: boolean;
  licensePlate?: string | null;
  onConfirm?: () => void;
  rawText?: string;
}

export const PhotoPreview = ({ 
  photoUrl, 
  onRetake, 
  isProcessing, 
  licensePlate,
  onConfirm,
  rawText 
}: PhotoPreviewProps) => {
  return (
    <div className="space-y-4 w-full flex flex-col items-center">
      <img 
        src={photoUrl} 
        alt="Captured" 
        className="w-full max-w-md rounded-lg shadow-lg"
      />
      
      {isProcessing ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Processing image...</p>
        </div>
      ) : licensePlate ? (
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold">
            Detected License Plate: <span className="text-primary">{licensePlate}</span>
          </div>
          {rawText && (
            <div className="text-sm text-muted-foreground">
              Full text detected: <span className="font-mono bg-muted px-2 py-1 rounded">{rawText}</span>
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={onConfirm} variant="default">
              Confirm & Continue
            </Button>
            <Button onClick={onRetake} variant="outline">
              Take Another Photo
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          onClick={onRetake}
          variant="outline"
          disabled={isProcessing}
        >
          Take Another Photo
        </Button>
      )}
    </div>
  );
};
