import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface SubscriptionManagerProps {
  conversationId: string;
  onNewMessage: (message: Message) => void;
}

export const useSubscription = ({ conversationId, onNewMessage }: SubscriptionManagerProps) => {
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up subscription for conversation:', conversationId);
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('Received message update:', payload);
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            onNewMessage(newMessage);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId]);
};