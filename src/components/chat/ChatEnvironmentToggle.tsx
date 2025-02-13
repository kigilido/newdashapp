
import { Users, MessageSquare } from "lucide-react";

interface ChatEnvironmentToggleProps {
  environment: "general" | "contacts";
  onToggle: () => void;
}

export const ChatEnvironmentToggle = ({ environment, onToggle }: ChatEnvironmentToggleProps) => {
  return (
    <div className="fixed top-20 right-4 z-20">
      <div className="relative bg-white rounded-full p-1 shadow-lg flex items-center">
        <button
          onClick={onToggle}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
            environment === "general"
              ? "bg-violet-600 text-white"
              : "text-gray-600 hover:text-violet-600"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">Chats</span>
        </button>
        <button
          onClick={onToggle}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
            environment === "contacts"
              ? "bg-violet-600 text-white"
              : "text-gray-600 hover:text-violet-600"
          }`}
        >
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Contacts</span>
        </button>
      </div>
    </div>
  );
};
