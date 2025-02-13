
import { useEffect, useState } from 'react';
import { Plugins } from '@capacitor/core';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const { Contacts } = Plugins;

export const useContactsPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const { toast } = useToast();

  const checkContactsPermission = async () => {
    try {
      const { granted } = await Contacts.checkPermissions();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error checking contacts permission:', error);
      return false;
    }
  };

  const requestContactsPermission = async () => {
    try {
      const { granted } = await Contacts.requestPermissions();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return false;
    }
  };

  const importPhoneContacts = async () => {
    if (!hasPermission) {
      const granted = await requestContactsPermission();
      if (!granted) {
        toast({
          title: "Permission Required",
          description: "Please grant contacts permission to import your contacts.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { contacts } = await Contacts.getContacts();
      
      // Get phone numbers from contacts
      const phoneNumbers = contacts
        .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .map(contact => ({
          name: contact.name?.display || 'Unknown',
          phoneNumber: contact.phoneNumbers![0].number,
        }));

      // Store phone contacts in the database
      for (const { name, phoneNumber } of phoneNumbers) {
        const { error } = await supabase
          .from('phone_contacts')
          .upsert({
            user_id: user.id,
            contact_name: name,
            contact_phone_number: phoneNumber.replace(/\D/g, ''), // Store only digits
          }, {
            onConflict: 'user_id,contact_phone_number'
          });

        if (error && error.code !== '23505') { // Ignore unique constraint violations
          console.error('Error storing contact:', error);
        }
      }

      toast({
        title: "Contacts Imported",
        description: `Successfully imported ${phoneNumbers.length} contacts`,
      });
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import contacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkContactsPermission();
  }, []);

  return {
    hasPermission,
    checkContactsPermission,
    requestContactsPermission,
    importPhoneContacts,
  };
};
