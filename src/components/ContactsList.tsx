
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
}

interface ContactsListProps {
  contacts?: Contact[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onNewContact?: () => void;
}

export const ContactsList = ({ 
  contacts = [], 
  selectedId = null, 
  onSelect = () => {}, 
  onNewContact = () => {} 
}: ContactsListProps) => {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");

  // Temporary mock data - this would be replaced with real contacts data
  const mockContacts: Contact[] = [
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      timestamp: "10:30 AM"
    },
    {
      id: "2",
      name: "Jane Smith",
      lastMessage: "See you tomorrow!",
      timestamp: "Yesterday"
    },
    {
      id: "3",
      name: "Mike Johnson",
      lastMessage: "Thanks for your help",
      timestamp: "2 days ago"
    }
  ];

  const handleAddContact = () => {
    if (newContactName.trim()) {
      // This would be replaced with actual contact creation logic
      console.log("Adding contact:", newContactName);
      setNewContactName("");
      setIsAddingContact(false);
      onNewContact();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isAddingContact ? (
          <div className="flex flex-col gap-2 w-full">
            <Input
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Enter contact name..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddContact} className="flex-1">Add</Button>
              <Button variant="ghost" onClick={() => {
                setIsAddingContact(false);
                setNewContactName("");
              }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingContact(true)}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {mockContacts.map((contact) => (
          <Card
            key={contact.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedId === contact.id
                ? "bg-violet-50 border-violet-200"
                : "hover:bg-violet-50/50"
            }`}
            onClick={() => onSelect(contact.id)}
          >
            <h3 className="font-medium">{contact.name}</h3>
            {contact.lastMessage && (
              <p className="text-sm text-muted-foreground truncate">
                {contact.lastMessage}
              </p>
            )}
            {contact.timestamp && (
              <span className="text-xs text-muted-foreground">
                {contact.timestamp}
              </span>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
