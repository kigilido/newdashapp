
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link",
      });
    } catch (error) {
      console.error("Error resending verification:", error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username,
          license_plate: licensePlate 
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data: { user }, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          if (error.message === "User already registered") {
            toast({
              title: "Account already exists",
              description: "Please sign in instead or use a different email.",
              variant: "destructive",
            });
            setIsSignUp(false);
            return;
          }
          throw error;
        }

        if (user) {
          await updateProfile(user.id);
        }

        toast({
          title: "Success",
          description: "Please check your email to verify your account",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message === "Email not confirmed") {
            toast({
              title: "Email not verified",
              description: (
                <div className="space-y-2">
                  <p>Please verify your email before signing in.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleResendVerification();
                    }}
                  >
                    Resend verification email
                  </Button>
                </div>
              ),
              duration: 10000,
            });
            return;
          }
          throw error;
        }

        toast({
          title: "Success",
          description: "Successfully logged in",
        });
        
        navigate("/app");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {isSignUp && (
            <>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              <Input
                type="text"
                placeholder="License Plate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                disabled={isLoading}
              />
            </>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
