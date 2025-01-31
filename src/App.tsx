import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import SplashScreen from "./components/SplashScreen";
import MainLayout from "./components/MainLayout";
import RssFeed from "./pages/RssFeed";
import ChatScreen from "./pages/ChatScreen";
import ScanScreen from "./pages/ScanScreen";
import MapScreen from "./pages/MapScreen";
import SettingsScreen from "./pages/SettingsScreen";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/app/chat" replace />} />
            <Route path="/app" element={<MainLayout />}>
              <Route path="rss" element={<RssFeed />} />
              <Route path="chat" element={<ChatScreen />} />
              <Route path="scan" element={<ScanScreen />} />
              <Route path="map" element={<MapScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
              <Route index element={<Navigate to="/app/chat" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/app/chat" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;