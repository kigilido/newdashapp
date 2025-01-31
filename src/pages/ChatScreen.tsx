import { Card } from "@/components/ui/card";
import { MessageBubble } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";
import { useState } from "react";

const ChatScreen = () => {
  const [messages, setMessages] = useState<Array<{ content: string; sent: boolean; timestamp: string }>>([
    {
      content: "Welcome to the chat! How can I help you today?",
      sent: false,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        content: message,
        sent: true,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-12rem)]">
      <Card className="p-4 h-[calc(100%-2rem)] flex flex-col bg-white/50 backdrop-blur-sm border-white/20">
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              content={message.content}
              sent={message.sent}
              timestamp={message.timestamp}
            />
          ))}
        </div>
        <MessageInput onSendMessage={handleSendMessage} />
      </Card>
    </div>
  );
};

export default ChatScreen;