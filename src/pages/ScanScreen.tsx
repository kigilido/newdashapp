import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarcodeScanner } from "@capacitor/barcode-scanner";
import { useToast } from "@/components/ui/use-toast";
import { detectQRCodeType, handleQRCodeContent } from "@/utils/qrcode";

const ScanScreen = () => {
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const checkPermissions = async () => {
    try {
      const { granted } = await BarcodeScanner.checkPermission({ force: true });
      if (!granted) {
        toast({
          title: "Permission denied",
          description: "Please grant camera permissions to scan QR codes.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  };

  const handleScan = async () => {
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) return;

      // Prepare UI
      document.querySelector('body')?.classList.add('scanner-active');

      // Start scanning
      setScanning(true);
      
      const result = await BarcodeScanner.scan();
      
      if (result.hasContent) {
        const type = detectQRCodeType(result.content);
        await handleQRCodeContent(type, result.content);
        
        toast({
          title: "Success",
          description: "QR code scanned successfully!",
        });
      }
    } catch (error) {
      console.error("Scanning failed:", error);
      toast({
        title: "Scanning failed",
        description: "There was an error while scanning the QR code.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
      document.querySelector('body')?.classList.remove('scanner-active');
    }
  };

  const stopScan = async () => {
    try {
      await BarcodeScanner.stopScan();
      setScanning(false);
      document.querySelector('body')?.classList.remove('scanner-active');
    } catch (error) {
      console.error("Error stopping scan:", error);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-12rem)]">
      <Card className="p-4 h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-white/20">
        {!scanning ? (
          <Button 
            onClick={handleScan}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90 transition-opacity"
          >
            Start Scanning
          </Button>
        ) : (
          <Button 
            onClick={stopScan}
            variant="destructive"
          >
            Stop Scanning
          </Button>
        )}
      </Card>
    </div>
  );
};

export default ScanScreen;