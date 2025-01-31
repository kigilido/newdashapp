import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export const Header = ({ title, showBack = false }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.pathname.startsWith('/app')) {
      navigate('/app/rss');
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
        {showBack ? (
          <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="hover:bg-accent">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {title}
        </h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>
    </header>
  );
};