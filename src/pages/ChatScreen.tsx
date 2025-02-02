import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageInput } from "@/components/MessageInput";
import { MessageBubble } from "@/components/MessageBubble";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the chat.",
          variant: "destructive",
        });
        navigate("/auth");
        return false;
      }
      return true;
    };

    const loadMessages = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;

        // Get or create a default conversation
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id')
          .limit(1)
          .single();

        let conversationId;
        
        if (!existingConversation) {
          const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert([{ 
              type: 'direct',
              title: 'General Chat',
              creator_id: (await supabase.auth.getUser()).data.user?.id
            }])
            .select()
            .single();

          if (createError) throw createError;
          conversationId = newConversation.id;

          // Add current user as participant
          await supabase
            .from('conversation_participants')
            .insert([{
              conversation_id: conversationId,
              user_id: (await supabase.auth.getUser()).data.user?.id
            }]);
        } else {
          conversationId = existingConversation.id;
        }

        // Load existing messages
        const { data: messageData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messageData || []);
        setIsLoading(false);
        scrollToBottom();

        // Subscribe to new messages
        const channel = supabase
          .channel('messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${conversationId}`
            },
            (payload) => {
              const newMessage = payload.new as Message;
              setMessages(prev => [...prev, newMessage]);
              scrollToBottom();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [toast, navigate]);

  const handleSendMessage = async (content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .limit(1)
        .single();

      if (!conversation) return;

      const { error } = await supabase
        .from('messages')
        .insert([{
          content,
          conversation_id: conversation.id,
          sender_id: user.id
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-12rem)]">
      <Card className="p-4 h-full bg-white/50 backdrop-blur-sm border-white/20 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  sent={message.sender_id === supabase.auth.getUser().data.user?.id}
                  timestamp={new Date(message.created_at).toLocaleTimeString()}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatScreen;