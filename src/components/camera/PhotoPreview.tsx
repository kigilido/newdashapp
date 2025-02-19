
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LicensePlateConfirmation } from "./LicensePlateConfirmation";

interface PhotoPreviewProps {
  photoUrl: string;
  onRetake: () => void;
  isProcessing: boolean;
  licensePlate: string | null;
  onConfirm: () => void;
  rawText: string | null;
}

export const PhotoPreview = ({
  photoUrl,
  onRetake,
  isProcessing,
  licensePlate,
  onConfirm,
  rawText
}: PhotoPreviewProps) => {
  if (licensePlate && licensePlate !== 'NO_PLATE_FOUND') {
    return (
      <LicensePlateConfirmation
        licensePlate={licensePlate}
        vehicleDetails={rawText}
        onConfirm={onConfirm}
        onRetake={onRetake}
        isProcessing={isProcessing}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
        <img
          src={photoUrl}
          alt="License plate preview"
          className="object-cover w-full h-full"
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="space-y-4 text-center">
              <Skeleton className="h-4 w-[200px] bg-white/20" />
              <Skeleton className="h-4 w-[160px] bg-white/20" />
              <p className="text-white text-sm">Processing image...</p>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onRetake}
        disabled={isProcessing}
        variant="outline"
        className="w-full"
      >
        Take Another Photo
      </Button>
    </div>
  );
};
