
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PushNotifications } from '@capacitor/push-notifications';

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
    const initializePushNotifications = async () => {
      try {
        // Check if we're on a mobile device by checking if PushNotifications is available
        if (PushNotifications) {
          // Register with FCM
          await PushNotifications.register();

          // Add listeners for push notifications
          await PushNotifications.addListener('registration', (token) => {
            console.log('Push registration success:', token.value);
          });

          await PushNotifications.addListener('registrationError', (err) => {
            console.error('Push registration failed:', err.error);
          });

          await PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received:', notification);
          });

          await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push notification action performed:', notification);
          });

          // Request permission
          const result = await PushNotifications.requestPermissions();
          if (result.receive === 'granted') {
            setNotificationPermission('granted');
            toast({
              title: "Notifications enabled",
              description: "You will now receive notifications for new messages",
            });
          } else {
            setNotificationPermission('denied');
          }
        } else {
          // Fallback to web notifications
          if ("Notification" in window) {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === "granted") {
              toast({
                title: "Notifications enabled",
                description: "You will now receive notifications for new messages",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    initializePushNotifications();
  }, []);

  const showNotification = async (message: Message) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (message.sender_id !== user?.id) {
      if (PushNotifications && notificationPermission === 'granted') {
        // For mobile push notifications, the notification is handled by the listeners
        // we set up in initializePushNotifications
        console.log('Message received, push notification will be handled by the system');
      } else if (notificationPermission === "granted" && document.visibilityState === "hidden") {
        // Fallback to web notifications
        new Notification("New Message", {
          body: message.content,
          icon: "/favicon.ico",
        });
      }
    }
  };

  return { showNotification };
};

