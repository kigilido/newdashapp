import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  className?: string;
}

export const MessageInput = ({ onSendMessage, className = "" }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent backdrop-blur-lg border-t border-border/50">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="bg-white/50 focus-visible:ring-violet-400/20 border-white/20"
        />
        <Button 
          type="submit" 
          size="icon"
          className="rounded-full bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90 transition-opacity"
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};