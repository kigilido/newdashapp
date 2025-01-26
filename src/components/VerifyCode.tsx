import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./ui/input-otp";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleComplete = (value: string) => {
    setCode(value);
    if (value.length === 6) {
      // Here we would typically verify the code
      // For now, we'll just navigate to the main app
      toast({
        title: "Verification successful",
        description: "Welcome to DASH!",
      });
      navigate("/app");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Verify your number</h2>
          <p className="text-muted-foreground mt-2">Enter the 6-digit code we sent you</p>
        </div>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => handleComplete(value)}
            render={({ slots }) => (
              <InputOTPGroup className="gap-2">
                {slots.map((slot, idx) => (
                  <InputOTPSlot key={idx} {...slot} index={idx} />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;