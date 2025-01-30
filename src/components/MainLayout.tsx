import { Outlet, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Rss, MessageSquare, Scan, MapPin, Settings } from "lucide-react";
import { Header } from "./Header";

const MainLayout = () => {
  const location = useLocation();
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
    <div className="flex flex-col min-h-screen">
      <Header title={getTitle()} showBack={location.pathname !== "/app/rss"} />
      <main className="flex-1 container mx-auto p-4 pb-20 mt-16">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;