import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessagesArea } from "@/components/MessagesArea";
import { ConversationList } from "@/components/ConversationList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
  const [showConversations, setShowConversations] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const setupSubscriptions = (conversationId: string) => {
    console.log('Setting up subscription for conversation:', conversationId);
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Received message update:', payload);
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            setMessages(prev => [...prev, newMessage]);
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
  };

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

      if (conversationsError) throw conversationsError;

      if (!conversationsData) {
        throw new Error('No conversations data received');
      }

      setConversations(conversationsData);
      if (conversationsData.length > 0 && !selectedConversation) {
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

  useEffect(() => {
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
      console.log('Loading messages for conversation:', selectedConversation);

      const loadMessages = async () => {
        try {
          const { data: messageData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', selectedConversation)
            .order('created_at', { ascending: true });

          if (messagesError) throw messagesError;
          
          console.log('Loaded messages:', messageData);
          setMessages(messageData || []);
          setIsLoading(false);
          if (isMobile) {
            setShowConversations(false);
          }
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

      return () => {
        cleanup();
      };
    }
  }, [selectedConversation, toast, isMobile]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([{
          content,
          conversation_id: selectedConversation,
          sender_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Optimistically add the message to the UI
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
      }
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

  const handleBackToConversations = () => {
    setShowConversations(true);
  };

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-12rem)]">
        {showConversations ? (
          <div className="h-full overflow-y-auto">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation}
              onSelect={setSelectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <Button
                variant="ghost"
                onClick={handleBackToConversations}
                className="flex items-center gap-2 text-violet-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Conversations
              </Button>
            </div>
            <Card className="flex-1 p-4 bg-white/50 backdrop-blur-sm border-white/20 flex flex-col">
              <MessagesArea
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
              />
            </Card>
          </div>
        )}
      </div>
    );
  }

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
      <Card className="col-span-3 p-4 bg-white/50 backdrop-blur-sm border-white/20 flex flex-col">
        <MessagesArea
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </Card>
    </div>
  );
};

export default ChatScreen;