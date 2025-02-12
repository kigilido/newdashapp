
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <img 
            src="/lovable-uploads/aba2c6a5-18db-4fd9-9e10-a812b08141d2.png"
            alt="Lynkr Logo"
            className="w-24 h-24 mx-auto mb-4 animate-fade-in"
          />
          <div className="relative inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Lynkr
            </h1>
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full"></div>
          </div>
          <p className="text-muted-foreground">
            Connect with friends and colleagues through personal and general conversations
          </p>
        </div>
        <div className="space-y-4">
          <Button
            className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700"
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
