
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Car, ArrowRight } from "lucide-react";

interface LicensePlateConfirmationProps {
  licensePlate: string;
  vehicleDetails: string | null;
  onConfirm: () => void;
  onRetake: () => void;
  isProcessing: boolean;
}

export const LicensePlateConfirmation = ({
  licensePlate,
  vehicleDetails,
  onConfirm,
  onRetake,
  isProcessing
}: LicensePlateConfirmationProps) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-4 p-4">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      
      <Card className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">License Plate Detected</h2>
          <p className="text-gray-500">Please confirm the details below</p>
        </div>

        <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Car className="h-6 w-6 text-gray-400" />
          <span className="text-xl font-bold text-gray-900">{licensePlate}</span>
        </div>

        {vehicleDetails && (
          <p className="text-sm text-gray-600 text-center">{vehicleDetails}</p>
        )}

        <div className="flex flex-col gap-2">
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full"
          >
            Continue to Chat
            <ArrowRight className="ml-2" />
          </Button>
          
          <Button
            variant="outline"
            onClick={onRetake}
            disabled={isProcessing}
            className="w-full"
          >
            Take Another Photo
          </Button>
        </div>
      </Card>
    </div>
  );
};
