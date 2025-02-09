
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MessagesArea } from "@/components/MessagesArea";

interface ChatViewProps {
  messages: any[];
  isLoading: boolean;
  handleSendMessage: (content: string) => void;
  handleBackToConversations: () => void;
  chatEnvironment: "general" | "contacts";
}

export const ChatView = ({
  messages,
  isLoading,
  handleSendMessage,
  handleBackToConversations,
  chatEnvironment,
}: ChatViewProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={handleBackToConversations}
          className="flex items-center gap-2 text-violet-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {chatEnvironment === "contacts" ? "Contacts" : "Conversations"}
        </Button>
      </div>
      <Card className="flex-1 p-4 bg-white/50 backdrop-blur-sm border-white/20 flex flex-col">
        <MessagesArea
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </Card>
    </div>
  );
};
