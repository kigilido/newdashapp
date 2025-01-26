import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="glass-panel fixed top-0 left-0 right-0 z-10 border-b border-border/50">
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium">Messages</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>
    </header>
  );
};