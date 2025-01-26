import { useState } from "react";
import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";

interface Message {
  id: number;
  content: string;
  sent: boolean;
  timestamp: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Welcome to the messaging app!",
      sent: false,
      timestamp: "12:00 PM"
    },
    {
      id: 2,
      content: "Thanks! This looks amazing",
      sent: true,
      timestamp: "12:01 PM"
    }
  ]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      content,
      sent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-20 pb-32">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              sent={message.sent}
              timestamp={message.timestamp}
            />
          ))}
        </div>
      </main>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Index;