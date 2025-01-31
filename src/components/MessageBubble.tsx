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
        "message-bubble group transition-all hover:scale-[1.02]",
        sent ? "message-bubble-sent" : "message-bubble-received"
      )}
    >
      <p className="text-sm md:text-base leading-relaxed">{content}</p>
      <p className="text-xs opacity-70 mt-2 transition-opacity group-hover:opacity-100">
        {timestamp}
      </p>
    </div>
  );
};