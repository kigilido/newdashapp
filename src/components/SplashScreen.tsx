import { Loader2 } from "lucide-react";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4 animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          DASH
        </h1>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
};

export default SplashScreen;