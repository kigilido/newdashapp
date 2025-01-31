import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { initTalkJS } from "@/utils/talkjs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Talk from "talkjs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ChatScreen = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the chat.",
          variant: "destructive",
        });
        navigate("/");
        return false;
      }
      return true;
    };

    const initializeChat = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;

        const session = await initTalkJS();
        
        if (!session || !chatContainerRef.current) {
          toast({
            title: "Error",
            description: "Failed to initialize chat. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        // Create a test user to chat with
        const otherUser = new Talk.User({
          id: "test-user-2",
          name: "Test User",
          photoUrl: "https://via.placeholder.com/150",
          role: "default",
        });

        // Create a conversation
        const conversation = session.getOrCreateConversation(Talk.oneOnOneId(session.me, otherUser));
        conversation.setParticipant(session.me);
        conversation.setParticipant(otherUser);

        // Create and mount the chatbox
        const chatbox = session.createChatbox(conversation);
        chatbox.mount(chatContainerRef.current);
        setIsLoading(false);

        console.log("Chat initialized successfully");
      } catch (error) {
        console.error("Error initializing TalkJS:", error);
        toast({
          title: "Error",
          description: "Failed to initialize chat. Please try again later.",
          variant: "destructive",
        });
      }
    };

    initializeChat();
  }, [toast, navigate]);

  return (
    <div className="space-y-4 h-[calc(100vh-12rem)]">
      <Card className="p-4 h-full bg-white/50 backdrop-blur-sm border-white/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : (
          <div ref={chatContainerRef} className="h-full" />
        )}
      </Card>
    </div>
  );
};

export default ChatScreen;