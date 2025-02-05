
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "./auth/AuthForm";

const AuthScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <Button
          variant="ghost"
          className="absolute top-4 left-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome to DASH</h2>
          <p className="text-muted-foreground mt-2">
            Sign in or create an account
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthScreen;
