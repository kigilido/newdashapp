import { Outlet, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Rss, MessageSquare, Scan, MapPin, Settings } from "lucide-react";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePreviewToggle } from "./MobilePreviewToggle";

const MainLayout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      <Header title={getTitle()} showBack={location.pathname !== "/app/rss"} />
      <main className="flex-1 container mx-auto p-4 pb-20 mt-16" style={{ maxWidth: 'var(--mobile-preview-width, 1280px)' }}>
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-border/50" style={{ maxWidth: 'var(--mobile-preview-width, none)', margin: 'var(--mobile-preview-width, 0) auto 0' }}>
        <div className="flex justify-around items-center h-16 max-w-4xl mx-auto px-4">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center p-2 rounded-lg transition-colors",
                  "hover:bg-violet-50",
                  isActive
                    ? "text-violet-600 bg-violet-50"
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
      {!isMobile && <MobilePreviewToggle />}
    </div>
  );
};

export default MainLayout;