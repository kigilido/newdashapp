
import { Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatEnvironmentToggleProps {
  environment: "general" | "contacts";
  onToggle: () => void;
}

export const ChatEnvironmentToggle = ({ environment, onToggle }: ChatEnvironmentToggleProps) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="icon"
      className="rounded-full w-12 h-12 fixed top-20 right-4 z-20 bg-white/80 backdrop-blur-sm hover:bg-violet-50"
    >
      {environment === "contacts" ? (
        <Users className="h-5 w-5 text-violet-600" />
      ) : (
        <MessageSquare className="h-5 w-5 text-violet-600" />
      )}
    </Button>
  );
};
