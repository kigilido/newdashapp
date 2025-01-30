import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { ArrowLeft } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const phoneNumber = sessionStorage.getItem("phoneNumber");

  if (!phoneNumber) {
    navigate("/auth");
    return null;
  }

  const handleComplete = async (value: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          code: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      toast({
        title: "Success",
        description: "Phone number verified successfully",
      });
      
      // Clear the phone number from session storage
      sessionStorage.removeItem("phoneNumber");
      navigate("/app");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <Button
          variant="ghost"
          className="absolute top-4 left-4"
          onClick={() => navigate("/auth")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Verify your phone</h2>
          <p className="text-muted-foreground mt-2">
            Enter the code sent to {phoneNumber}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            variant="link"
            onClick={() => navigate("/auth")}
            disabled={isLoading}
          >
            Didn't receive a code? Try again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;