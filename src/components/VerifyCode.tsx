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
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} {...slots[index]} index={index} />
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