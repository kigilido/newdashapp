
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const resendVerificationEmail = async (email: string) => {
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

export const updateProfile = async (userId: string, username: string, licensePlate: string) => {
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
