import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Index from "./pages/Index";
import SplashScreen from "./components/SplashScreen";
import PhoneAuth from "./components/PhoneAuth";
import VerifyCode from "./components/VerifyCode";
import MainLayout from "./components/MainLayout";

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
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<PhoneAuth />} />
            <Route path="/verify" element={<VerifyCode />} />
            <Route path="/app" element={<MainLayout />}>
              <Route path="rss" element={<div>RSS Feed</div>} />
              <Route path="chat" element={<Index />} />
              <Route path="scan" element={<div>Scan</div>} />
              <Route path="map" element={<div>Map</div>} />
              <Route path="settings" element={<div>Settings</div>} />
              <Route index element={<Navigate to="/app/rss" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;