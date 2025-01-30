import { useState } from "react";
import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";
import { CategoryToggle } from "@/components/CategoryToggle";
import { ContactsList } from "@/components/ContactsList";

interface Message {
  id: number;
  content: string;
  sent: boolean;
  timestamp: string;
  category: "personal" | "general";
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Welcome to the messaging app!",
      sent: false,
      timestamp: "12:00 PM",
      category: "general"
    },
    {
      id: 2,
      content: "Thanks! This looks amazing",
      sent: true,
      timestamp: "12:01 PM",
      category: "general"
    },
    {
      id: 3,
      content: "Hi there! This is a personal message.",
      sent: true,
      timestamp: "12:02 PM",
      category: "personal"
    }
  ]);

  const [activeCategory, setActiveCategory] = useState<"personal" | "general">("personal");
  const [showContacts, setShowContacts] = useState(true);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      content,
      sent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: activeCategory
    };
    setMessages([...messages, newMessage]);
  };

  const toggleCategory = () => {
    setActiveCategory(prev => prev === "personal" ? "general" : "personal");
  };

  const filteredMessages = messages.filter(message => message.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header title="Messages" />
      <CategoryToggle category={activeCategory} onToggle={toggleCategory} />
      
      <main className="max-w-4xl mx-auto px-4 py-20 pb-32 flex">
        {showContacts && (
          <div className="w-80 mr-4 hidden md:block">
            <ContactsList />
          </div>
        )}
        <div className="flex-1 space-y-4">
          {filteredMessages.map((message) => (
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