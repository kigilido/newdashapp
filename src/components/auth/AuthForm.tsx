
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateProfile } from "@/utils/auth";
import { ResendVerificationButton } from "./ResendVerificationButton";

export const AuthForm = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields for signup
    if (isSignUp && (!emailOrUsername || !password || !username || !licensePlate)) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields for login
    if (!isSignUp && (!emailOrUsername || !password)) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // For signup, we always use email
        const { data: { user }, error } = await supabase.auth.signUp({
          email: emailOrUsername,
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
          await updateProfile(user.id, username, licensePlate);
        }

        toast({
          title: "Success",
          description: "Please check your email to verify your account",
        });
      } else {
        // For login, first try with email
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emailOrUsername,
          password,
        });

        if (signInError) {
          // If email login fails, try to find user by username
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', emailOrUsername)
            .single();

          if (profileError) {
            throw signInError; // If no username found, show original error
          }

          // Try login with email from profile
          const { error: finalError } = await supabase.auth.signInWithPassword({
            email: profiles.email,
            password,
          });

          if (finalError) {
            if (finalError.message === "Email not confirmed") {
              toast({
                title: "Email not verified",
                description: (
                  <div className="space-y-2">
                    <p>Please verify your email before signing in.</p>
                    <ResendVerificationButton email={emailOrUsername} />
                  </div>
                ),
                duration: 10000,
              });
              return;
            }
            throw finalError;
          }
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder={isSignUp ? "Email" : "Email or Username"}
        value={emailOrUsername}
        onChange={(e) => setEmailOrUsername(e.target.value)}
        disabled={isLoading}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        required
      />
      {isSignUp && (
        <>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input
            type="text"
            placeholder="License Plate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
            disabled={isLoading}
            required
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
  );
};
