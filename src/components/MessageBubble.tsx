import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  sent: boolean;
  timestamp: string;
}

export const MessageBubble = ({ content, sent, timestamp }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "message-bubble",
        sent ? "message-bubble-sent" : "message-bubble-received"
      )}
    >
      <p className="text-sm md:text-base">{content}</p>
      <p className="text-xs opacity-70 mt-1">{timestamp}</p>
    </div>
  );
};