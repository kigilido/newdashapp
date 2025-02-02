import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface MessagesAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
}

export const MessagesArea = ({ messages, isLoading, onSendMessage }: MessagesAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  sender_id={message.sender_id}
                  timestamp={new Date(message.created_at).toLocaleTimeString()}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <MessageInput onSendMessage={onSendMessage} className="mt-4" />
        </>
      )}
    </div>
  );
};