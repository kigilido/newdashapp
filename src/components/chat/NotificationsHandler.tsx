import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export const useNotifications = () => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === "granted") {
          toast({
            title: "Notifications enabled",
            description: "You will now receive notifications for new messages",
          });
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
  };

  const showNotification = async (message: Message) => {
    if (notificationPermission === "granted" && document.visibilityState === "hidden") {
      const { data: { user } } = await supabase.auth.getUser();
      if (message.sender_id !== user?.id) {
        new Notification("New Message", {
          body: message.content,
          icon: "/favicon.ico",
        });
      }
    }
  };

  useEffect(() => {
    if (notificationPermission === "default") {
      requestNotificationPermission();
    }
  }, [notificationPermission]);

  return { showNotification };
};