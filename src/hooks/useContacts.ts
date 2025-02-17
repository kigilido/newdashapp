
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/contacts";
import { useToast } from "@/hooks/use-toast";

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    loadContacts();
  }, []);

  return { contacts, isLoading, refreshContacts: loadContacts };
};
