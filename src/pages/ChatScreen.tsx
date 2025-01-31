import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { initTalkJS } from "@/utils/talkjs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const ChatScreen = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const session = await initTalkJS();
        
        if (!session || !chatContainerRef.current) {
          toast({
            title: "Error",
            description: "Failed to initialize chat. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        const inbox = session.createInbox();
        inbox.mount(chatContainerRef.current);
        setIsLoading(false);
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
  }, [toast]);

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