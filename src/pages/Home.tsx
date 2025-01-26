import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            DASH
          </h1>
          <p className="text-muted-foreground">
            Connect with friends and colleagues through personal and general conversations
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate("/chat")}
            className="w-full h-14 text-lg flex items-center gap-3"
          >
            <MessageSquare className="w-5 h-5" />
            Start Messaging
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/contacts")}
            className="w-full h-14 text-lg flex items-center gap-3"
          >
            <Users className="w-5 h-5" />
            View Contacts
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Switch between Personal and General chats with a single tap
        </p>
      </div>
    </div>
  );
};

export default Home;