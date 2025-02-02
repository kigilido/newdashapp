import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageBubbleProps {
  content: string;
  sender_id: string;
  timestamp: string;
}

export const MessageBubble = ({ content, sender_id, timestamp }: MessageBubbleProps) => {
  const [isSentByMe, setIsSentByMe] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsSentByMe(user?.id === sender_id);
    };
    checkUser();
  }, [sender_id]);

  return (
    <div
      className={cn(
        "flex flex-col max-w-[80%] space-y-1",
        isSentByMe ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-2 break-words",
          isSentByMe
            ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white"
            : "bg-white/80 border border-white/20"
        )}
      >
        <p className="text-sm md:text-base leading-relaxed">{content}</p>
      </div>
      <span className="text-xs text-muted-foreground px-2">{timestamp}</span>
    </div>
  );
};