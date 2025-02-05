
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { ResendVerificationButton } from "./ResendVerificationButton";
import { SignUpFields } from "./SignUpFields";
import { useAuth } from "@/hooks/useAuth";

export const AuthForm = () => {
  const {
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
  } = useAuth();

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
        await handleSignUp();
      } else {
        await handleSignIn();
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
        <SignUpFields
          username={username}
          setUsername={setUsername}
          licensePlate={licensePlate}
          setLicensePlate={setLicensePlate}
          isLoading={isLoading}
        />
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
