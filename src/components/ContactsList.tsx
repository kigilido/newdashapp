
import { ContactCard } from "./contacts/ContactCard";
import { AddContactForm } from "./contacts/AddContactForm";
import { useContacts } from "@/hooks/useContacts";
import { ContactsListProps } from "@/types/contacts";

export const ContactsList = ({ 
  selectedId = null, 
  onSelect = () => {}, 
  onNewContact = () => {} 
}: ContactsListProps) => {
  const { contacts, isLoading, refreshContacts } = useContacts();

  const handleContactAdded = () => {
    refreshContacts();
    onNewContact();
  };

  if (isLoading) {
    return <div className="p-4">Loading contacts...</div>;
  }

  return (
    <div className="relative h-full">
      <div className="space-y-2">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isSelected={selectedId === contact.id}
            onClick={() => onSelect(contact.id)}
          />
        ))}
      </div>
      <AddContactForm onSuccess={handleContactAdded} />
    </div>
  );
};
