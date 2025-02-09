
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
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <Button
          variant="ghost"
          onClick={handleBackToConversations}
          className="flex items-center gap-2 text-gray-600 hover:bg-gray-50 m-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {chatEnvironment === "contacts" ? "Contacts" : "Conversations"}
        </Button>
      </div>
      <div className="flex-1 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABYSURBVDiNY/z//z8DNQETlUIzMDAw/P//n4Wqqv///z8LIxCQrJKRkZGBkZERbDATlsD4//8/A+P///8ZmKAMBgYGBkao8ThrJSE7CYUd9Q0kFHeUhyH1AQAoLh4swm4UyQAAAABJRU5ErkJggg==')] p-4">
        <MessagesArea
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};
