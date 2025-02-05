
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { updateProfile } from "@/utils/auth";

export const useAuth = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/app");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/app");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async () => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: emailOrUsername,
      password,
      options: {
        data: {
          username,
          license_plate: licensePlate
        }
      }
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
  };

  const handleSignIn = async () => {
    // First try with email
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailOrUsername,
      password,
    });

    if (signInError) {
      // If email login fails, try to find user by username
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', emailOrUsername)
        .maybeSingle();

      if (!profiles) {
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
  };

  return {
    emailOrUsername,
    setEmailOrUsername,
    password,
    setPassword,
    username,
    setUsername,
    licensePlate,
    setLicensePlate,
    isLoading,
    setIsLoading,
    isSignUp,
    setIsSignUp,
    handleSignUp,
    handleSignIn,
  };
};
