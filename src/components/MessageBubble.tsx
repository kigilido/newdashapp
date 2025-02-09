
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
        "flex flex-col max-w-[70%] space-y-1",
        isSentByMe ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-3 py-2 break-words shadow-sm",
          isSentByMe
            ? "bg-[#E7FFDB] text-gray-800 rounded-tr-none"
            : "bg-white text-gray-800 rounded-tl-none"
        )}
      >
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
      <span className="text-[11px] text-gray-500 px-1">{timestamp}</span>
    </div>
  );
};
