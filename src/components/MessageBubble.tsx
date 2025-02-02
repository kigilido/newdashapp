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
        "flex flex-col max-w-[80%] space-y-1",
        sent ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-2 break-words",
          sent
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