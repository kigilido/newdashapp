import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan } from "lucide-react";

const ScanScreen = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Scan</h1>
      <Card className="text-center">
        <CardHeader>
          <CardTitle>QR Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8">
            <Scan className="h-24 w-24 text-muted-foreground" />
            <p className="mt-4">Position QR code within the frame to scan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanScreen;