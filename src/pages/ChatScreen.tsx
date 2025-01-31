import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { initTalkJS } from "@/utils/talkjs";
import { Skeleton } from "@/components/ui/skeleton";

const ChatScreen = () => {
  const chatboxEl = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initChat = async () => {
      const session = await initTalkJS();
      if (!session) return;

      const inbox = session.createInbox();
      if (chatboxEl.current) {
        inbox.mount(chatboxEl.current);
        setLoading(false);
      }
    };

    initChat();
  }, []);

  return (
    <div className="space-y-4 h-[calc(100vh-12rem)]">
      <h1 className="text-2xl font-bold">Messages</h1>
      {loading ? (
        <Card className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-12 w-1/2" />
        </Card>
      ) : (
        <div ref={chatboxEl} className="h-full" />
      )}
    </div>
  );
};

export default ChatScreen;