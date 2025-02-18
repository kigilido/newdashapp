
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name?: string | null;
  contact_user_id: string;
  username?: string | null;
}

interface ContactsListProps {
  contacts?: Contact[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onNewContact?: () => void;
}

export const ContactsList = ({ 
  selectedId = null, 
  onSelect = () => {}, 
  onNewContact = () => {} 
}: ContactsListProps) => {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [username, setUsername] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          name,
          contact_user_id,
          profiles!contacts_contact_user_id_fkey (username)
        `)
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      if (contactsData) {
        const formattedContacts = contactsData.map(contact => ({
          id: contact.id,
          name: contact.name,
          contact_user_id: contact.contact_user_id,
          username: contact.profiles?.username
        }));
        setContacts(formattedContacts);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (username.trim()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // First find the user by username
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

        // Add the contact
        const { error: contactError } = await supabase
          .from('contacts')
          .insert([
            {
              contact_user_id: profiles.id,
              name: profiles.username,
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
        loadContacts();
        onNewContact();
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

  if (isLoading) {
    return <div className="p-4">Loading contacts...</div>;
  }

  return (
    <div className="relative h-full">
      <div className="space-y-2">
        {contacts.map((contact) => (
          <Card
            key={contact.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedId === contact.id
                ? "bg-violet-50 border-violet-200"
                : "hover:bg-violet-50/50"
            }`}
            onClick={() => onSelect(contact.id)}
          >
            <h3 className="font-medium">
              {contact.name || contact.username || "Unknown Contact"}
            </h3>
          </Card>
        ))}
      </div>

      {isAddingContact ? (
        <div className="fixed bottom-20 right-4 left-4 bg-white p-4 rounded-lg shadow-lg z-20">
          <div className="flex flex-col gap-2">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
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
      ) : (
        <Button
          onClick={() => setIsAddingContact(true)}
          size="icon"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};
