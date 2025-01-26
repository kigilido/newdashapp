import { Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryToggleProps {
  category: "personal" | "general";
  onToggle: () => void;
}

export const CategoryToggle = ({ category, onToggle }: CategoryToggleProps) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="icon"
      className="rounded-full w-12 h-12 fixed top-20 right-4 z-20 glass-panel"
    >
      {category === "personal" ? (
        <User className="h-5 w-5" />
      ) : (
        <Users className="h-5 w-5" />
      )}
    </Button>
  );
};