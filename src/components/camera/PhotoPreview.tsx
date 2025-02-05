
import { Button } from "@/components/ui/button";

interface PhotoPreviewProps {
  photoUrl: string;
  onRetake: () => void;
  isProcessing: boolean;
}

export const PhotoPreview = ({ photoUrl, onRetake, isProcessing }: PhotoPreviewProps) => {
  return (
    <div className="space-y-4 w-full flex flex-col items-center">
      <img 
        src={photoUrl} 
        alt="Captured" 
        className="w-full max-w-md rounded-lg shadow-lg"
      />
      <Button 
        onClick={onRetake}
        variant="outline"
        disabled={isProcessing}
      >
        Take Another Photo
      </Button>
    </div>
  );
};
