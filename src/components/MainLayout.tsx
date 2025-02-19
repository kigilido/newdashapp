import { Outlet, useLocation, NavLink } from "react-router-dom";
import { Rss, MessageSquare, Scan, MapPin, Settings } from "lucide-react";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePreviewToggle } from "./MobilePreviewToggle";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [longPressedItem, setLongPressedItem] = useState<string | null>(null);
  const navigate = useNavigate();

  const navItems = [
    { icon: Rss, label: "RSS", path: "/app/rss" },
    { icon: MessageSquare, label: "Chat", path: "/app/chat" },
    { icon: Scan, label: "Scan", path: "/app/scan" },
    { icon: MapPin, label: "Map", path: "/app/map" },
    { icon: Settings, label: "Settings", path: "/app/settings" },
  ];

  const getTitle = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : "DASH";
  };

  const mobileWidth = "390px";

  let longPressTimer: NodeJS.Timeout;
  const longPressDuration = 500;

  const handleMouseDown = (label: string) => {
    longPressTimer = setTimeout(() => {
      if (label === "Map" || label === "Chat") {
        setLongPressedItem(label);
        setShowDialog(true);
      }
    }, longPressDuration);
  };

  const handleMouseUp = () => {
    clearTimeout(longPressTimer);
  };

  const handleMouseLeave = () => {
    clearTimeout(longPressTimer);
  };

  const getDialogOptions = (label: string) => {
    switch (label) {
      case "Map":
        return [
          { label: "Share Location", action: "share_location" },
          { label: "Save to Favorites", action: "save_favorites" },
          { label: "View History", action: "view_history" },
          { label: "Settings", action: "settings" },
        ];
      case "Chat":
        return [
          { label: "New Group Chat", action: "new_group" },
          { label: "Mute Notifications", action: "mute" },
          { label: "Mark All as Read", action: "mark_read" },
          { label: "Chat Settings", action: "chat_settings" },
        ];
      default:
        return [];
    }
  };

  const handleOptionClick = (option: string, action: string) => {
    if (action === "chat_settings") {
      navigate("/app/settings/chat");
      setShowDialog(false);
      setLongPressedItem(null);
      return;
    }

    toast({
      title: "Option Selected",
      description: `You selected: ${option}`,
    });
    setShowDialog(false);
    setLongPressedItem(null);
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-[#F8F9FA]"
      style={{ 
        width: isMobile ? '100%' : mobileWidth,
        margin: isMobile ? '0' : '0 auto',
        boxShadow: isMobile ? 'none' : '0 0 20px rgba(0, 0, 0, 0.1)',
        height: isMobile ? '100%' : '100vh',
        overflow: 'hidden'
      }}
    >
      <Header title={getTitle()} showBack={location.pathname !== "/app/rss"} />
      <main 
        className="flex-1 container mx-auto p-4 pb-20 mt-16" 
        style={{ 
          maxWidth: isMobile ? '100%' : mobileWidth,
          width: '100%'
        }}
      >
        <Outlet />
      </main>
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-border/50" 
        style={{ 
          maxWidth: isMobile ? 'none' : mobileWidth,
          margin: isMobile ? '0' : '0 auto',
          width: '100%'
        }}
      >
        <div className="flex justify-around items-center h-16 max-w-4xl mx-auto px-4">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              onMouseDown={() => handleMouseDown(label)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={() => handleMouseDown(label)}
              onTouchEnd={handleMouseUp}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center p-2 rounded-lg transition-colors relative",
                  "hover:bg-[#3A86FF]/10",
                  isActive
                    ? "text-[#3A86FF] bg-[#3A86FF]/10"
                    : "text-muted-foreground"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{longPressedItem} Options</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {getDialogOptions(longPressedItem || "").map((option) => (
              <Button 
                key={option.action}
                variant="outline" 
                onClick={() => handleOptionClick(option.label, option.action)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {!isMobile && <MobilePreviewToggle />}
    </div>
  );
};

export default MainLayout;
