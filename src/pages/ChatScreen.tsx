import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageInput } from "@/components/MessageInput";
import { MessageBubble } from "@/components/MessageBubble";
import { ConversationList } from "@/components/ConversationList";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupSubscriptions = (conversationId: string) => {
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
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) {
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

    const loadConversations = async () => {
      try {
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .order('created_at', { ascending: false });

        if (conversationsError) {
          throw conversationsError;
        }

        if (!conversationsData) {
          throw new Error('No conversations data received');
        }

        setConversations(conversationsData);
        if (conversationsData.length > 0) {
          setSelectedConversation(conversationsData[0].id);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    const initialize = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await loadConversations();
      }
    };

    initialize();
  }, [toast, navigate]);

  useEffect(() => {
    if (selectedConversation) {
      setIsLoading(true);
      setMessages([]);

      const loadMessages = async () => {
        try {
          const { data: messageData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', selectedConversation)
            .order('created_at', { ascending: true });

          if (messagesError) throw messagesError;
          
          setMessages(messageData || []);
          setIsLoading(false);
          scrollToBottom();
        } catch (error) {
          console.error('Error loading messages:', error);
          toast({
            title: "Error",
            description: "Failed to load messages. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      };

      const cleanup = setupSubscriptions(selectedConversation);
      loadMessages();
      return cleanup;
    }
  }, [selectedConversation, toast]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .insert([{
          content,
          conversation_id: selectedConversation,
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

  const handleNewConversation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
      if (data && data.length > 0) {
        setSelectedConversation(data[0].id);
      }
    } catch (error) {
      console.error('Error refreshing conversations:', error);
      toast({
        title: "Error",
        description: "Failed to refresh conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
      <div className="col-span-1 overflow-y-auto">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation}
          onSelect={setSelectedConversation}
          onNewConversation={handleNewConversation}
        />
      </div>
      <Card className="col-span-3 p-4 h-full bg-white/50 backdrop-blur-sm border-white/20 flex flex-col">
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
                  sent={message.sender_id === supabase.auth.getUser().then(({ data }) => data.user?.id)}
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