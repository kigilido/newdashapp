
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Camera } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="sticky bottom-16 left-0 right-0 bg-gray-50 border-t border-gray-200 p-2">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Button 
          type="button" 
          size="icon" 
          variant="ghost"
          className="text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        >
          <Camera className="h-5 w-5" />
        </Button>
        <Button 
          type="button" 
          size="icon" 
          variant="ghost"
          className="text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className="bg-white border-gray-200 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button 
          type="submit" 
          size="icon"
          className="rounded-full bg-[#00A884] hover:bg-[#008f6f] transition-colors"
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
