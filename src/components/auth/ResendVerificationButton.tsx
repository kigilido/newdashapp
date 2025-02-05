
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/utils/auth";

interface ResendVerificationButtonProps {
  email: string;
}

export const ResendVerificationButton = ({ email }: ResendVerificationButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        resendVerificationEmail(email);
      }}
    >
      Resend verification email
    </Button>
  );
};
