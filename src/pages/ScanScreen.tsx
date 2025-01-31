import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, User, FileText } from "lucide-react";
import { Camera } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor/barcode-scanner';

const ScanScreen = () => {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    text: string;
    type: "url" | "contact" | "text";
  } | null>(null);
  const { toast } = useToast();

  const detectQRCodeType = (text: string) => {
    // Check if it's a URL
    if (text.match(/^(http|https):\/\//i)) {
      return "url";
    }
    // Check if it's a vCard/contact info (basic check)
    if (text.startsWith("BEGIN:VCARD") || text.includes("TEL:") || text.includes("EMAIL:")) {
      return "contact";
    }
    // Default to text
    return "text";
  };

  const handleScan = async () => {
    try {
      // Request camera permissions
      const permission = await Camera.requestPermissions();
      if (permission.camera !== 'granted') {
        toast({
          title: "Permission Denied",
          description: "Camera permission is required to scan QR codes",
        });
        return;
      }

      // Start scanning
      setScanning(true);
      const result = await BarcodeScanner.scan();
      
      if (result.hasContent) {
        const type = detectQRCodeType(result.content);
        setLastResult({ text: result.content, type });
        
        toast({
          title: "QR Code Scanned!",
          description: `Type: ${type.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error('Scanning error:', error);
      toast({
        title: "Scanning Error",
        description: "Failed to scan QR code",
      });
    } finally {
      setScanning(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (lastResult) {
      await navigator.clipboard.writeText(lastResult.text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    }
  };

  const handleOpenUrl = () => {
    if (lastResult?.type === "url") {
      window.open(lastResult.text, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Scan</h1>
      <Card>
        <CardHeader>
          <CardTitle>QR Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Button 
              onClick={handleScan}
              className="w-full max-w-xs"
              disabled={scanning}
            >
              {scanning ? "Scanning..." : "Start Scanning"}
            </Button>
            
            {lastResult && (
              <Card className="w-full mt-4">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    {lastResult.type === "url" && <ExternalLink className="h-4 w-4" />}
                    {lastResult.type === "contact" && <User className="h-4 w-4" />}
                    {lastResult.type === "text" && <FileText className="h-4 w-4" />}
                    <span className="font-semibold">
                      {lastResult.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground break-all mb-4">
                    {lastResult.text}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyToClipboard}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    
                    {lastResult.type === "url" && (
                      <Button
                        size="sm"
                        onClick={handleOpenUrl}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open URL
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanScreen;