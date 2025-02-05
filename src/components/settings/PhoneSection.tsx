
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

type PhoneSectionProps = {
  currentPhoneNumber: string | undefined;
  userId: string;
  onUpdate: () => void;
};

export const PhoneSection = ({ currentPhoneNumber, userId, onUpdate }: PhoneSectionProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();

  const handleUpdatePhoneNumber = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: phoneNumber })
        .eq('id', userId);

      if (error) throw error;
      
      toast({
        title: "Phone number updated",
        description: "Your phone number has been updated successfully.",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error updating phone number",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Update Phone Number
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
        <Button 
          onClick={handleUpdatePhoneNumber}
          disabled={!phoneNumber || phoneNumber === currentPhoneNumber}
        >
          Update Phone Number
        </Button>
      </CardContent>
    </Card>
  );
};
