
import { Loader2 } from "lucide-react";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4 animate-fade-in">
        <img 
          src="/lovable-uploads/aba2c6a5-18db-4fd9-9e10-a812b08141d2.png"
          alt="Lynkr Logo"
          className="w-24 h-24 mb-2 animate-fade-in"
        />
        <div className="relative">
          <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Lynkr
          </div>
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full"></div>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    </div>
  );
};

export default SplashScreen;
