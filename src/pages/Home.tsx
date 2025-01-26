import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
            className="w-full"
            size="lg"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;