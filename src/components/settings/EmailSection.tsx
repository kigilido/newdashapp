
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

type EmailSectionProps = {
  currentEmail: string | undefined;
};

export const EmailSection = ({ currentEmail }: EmailSectionProps) => {
  const [newEmail, setNewEmail] = useState("");
  const { toast } = useToast();

  const handleUpdateEmail = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      toast({
        title: "Email update initiated",
        description: "Please check your new email for confirmation.",
      });
      setNewEmail("");
    } catch (error) {
      toast({
        title: "Error updating email",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Update Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newEmail">New Email Address</Label>
          <Input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email address"
          />
        </div>
        <Button 
          onClick={handleUpdateEmail}
          disabled={!newEmail || newEmail === currentEmail}
        >
          Update Email
        </Button>
      </CardContent>
    </Card>
  );
};
