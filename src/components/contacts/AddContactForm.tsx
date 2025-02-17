
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddContactFormProps {
  onSuccess: () => void;
}

export const AddContactForm = ({ onSuccess }: AddContactFormProps) => {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [username, setUsername] = useState("");
  const { toast } = useToast();

  const handleAddContact = async () => {
    if (username.trim()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', username.trim())
          .single();

        if (profileError || !profiles) {
          toast({
            title: "User not found",
            description: "No user found with that username",
            variant: "destructive",
          });
          return;
        }

        const { error: contactError } = await supabase
          .from('contacts')
          .insert([
            {
              contact_user_id: profiles.id,
              name: username.trim(),
              user_id: user.id
            }
          ]);

        if (contactError) {
          if (contactError.code === '23505') {
            toast({
              title: "Contact exists",
              description: "This user is already in your contacts",
              variant: "destructive",
            });
          } else {
            throw contactError;
          }
          return;
        }

        toast({
          title: "Success",
          description: "Contact added successfully",
        });

        setUsername("");
        setIsAddingContact(false);
        onSuccess();
      } catch (error) {
        console.error('Error adding contact:', error);
        toast({
          title: "Error",
          description: "Failed to add contact. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (!isAddingContact) {
    return (
      <Button
        onClick={() => setIsAddingContact(true)}
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20"
      >
        <Plus className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 left-4 bg-white p-4 rounded-lg shadow-lg z-20">
      <div className="flex flex-col gap-2">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter contact name..."
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button onClick={handleAddContact} className="flex-1">
            Add
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setIsAddingContact(false);
              setUsername("");
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
