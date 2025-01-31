import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const ScanScreen = () => {
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Success callback
          toast({
            title: "QR Code Scanned!",
            description: decodedText,
          });
          if (scanner) {
            scanner.clear();
            setScanning(false);
          }
        },
        (error) => {
          // Silence errors as they're expected when scanning
          console.debug("QR Code scanning in progress:", error);
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanning, toast]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Scan</h1>
      <Card>
        <CardHeader>
          <CardTitle>QR Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          {!scanning ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Button 
                onClick={() => setScanning(true)}
                className="w-full max-w-xs"
              >
                Start Scanning
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div id="reader" className="w-full max-w-sm"></div>
              <Button 
                onClick={() => setScanning(false)}
                variant="outline"
                className="mt-4"
              >
                Stop Scanning
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanScreen;