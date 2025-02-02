import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const MobilePreviewToggle = () => {
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const root = document.documentElement;
    if (isMobilePreview) {
      root.style.setProperty('--mobile-preview-width', '390px');
      toast({
        title: "Mobile Preview Mode",
        description: "The app is now displayed in mobile view. Click again to exit.",
      });
    } else {
      root.style.removeProperty('--mobile-preview-width');
    }
  }, [isMobilePreview]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed bottom-20 right-4 z-50 bg-white/80 backdrop-blur-sm shadow-lg hover:bg-violet-50"
      onClick={() => setIsMobilePreview(!isMobilePreview)}
    >
      <Smartphone className={isMobilePreview ? "text-violet-600" : "text-muted-foreground"} />
    </Button>
  );
};