
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
import AccountSettingsScreen from "./pages/settings/AccountSettingsScreen";
import GeneralSettingsScreen from "./pages/settings/GeneralSettingsScreen";
import PrivacySettingsScreen from "./pages/settings/PrivacySettingsScreen";
import AdminSettingsScreen from "./pages/settings/AdminSettingsScreen";
import AuthScreen from "./components/AuthScreen";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={session ? <Navigate to="/app/chat" replace /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/auth" 
              element={session ? <Navigate to="/app/chat" replace /> : <AuthScreen />} 
            />
            <Route 
              path="/app" 
              element={session ? <MainLayout /> : <Navigate to="/auth" replace />}
            >
              <Route path="rss" element={<RssFeed />} />
              <Route path="chat" element={<ChatScreen />} />
              <Route path="scan" element={<ScanScreen />} />
              <Route path="map" element={<MapScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
              <Route path="settings/account" element={<AccountSettingsScreen />} />
              <Route path="settings/general" element={<GeneralSettingsScreen />} />
              <Route path="settings/privacy" element={<PrivacySettingsScreen />} />
              <Route path="settings/admin" element={<AdminSettingsScreen />} />
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
