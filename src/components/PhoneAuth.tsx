import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "");
    
    // Format as (XXX) XXX-XXXX
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert formatted number to E.164 format (+1XXXXXXXXXX)
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    const e164Number = `+1${cleanNumber}`;
    setIsLoading(true);
    
    try {
      const { error, data } = await supabase.functions.invoke('send-verification', {
        body: { phoneNumber: e164Number }
      });

      if (error) {
        throw error;
      }

      // Check if we need to verify the phone number first
      if (data?.verificationRequired) {
        toast({
          title: "Phone number verification required",
          description: "Since this is a trial account, you need to verify your phone number first. Please visit the Twilio Console to verify your number.",
          variant: "destructive",
        });
        // Optionally open Twilio verification page in new tab
        window.open(data.verificationUrl, '_blank');
        return;
      }

      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code",
      });
      
      // Store the phone number in session storage for verification
      sessionStorage.setItem("phoneNumber", e164Number);
      navigate("/verify");
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code. Please try again.",
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
          <p className="text-muted-foreground mt-2">Enter your phone number to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="tel"
            placeholder="(555) 555-5555"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className="text-lg"
            disabled={isLoading}
            maxLength={14}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PhoneAuth;