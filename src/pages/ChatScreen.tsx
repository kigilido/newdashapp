import { Card } from "@/components/ui/card";
import { MessageBubble } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";
import { useState } from "react";

const ChatScreen = () => {
  const [messages, setMessages] = useState<Array<{ content: string; sent: boolean; timestamp: string }>>([
    {
      content: "Welcome to the chat! TalkJS integration is currently disabled.",
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
      <h1 className="text-2xl font-bold">Messages</h1>
      <Card className="p-4 h-[calc(100%-6rem)] flex flex-col">
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