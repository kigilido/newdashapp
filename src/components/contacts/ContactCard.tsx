
import { Card } from "@/components/ui/card";
import { Contact } from "@/types/contacts";

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}

export const ContactCard = ({ contact, isSelected, onClick }: ContactCardProps) => {
  return (
    <Card
      className={`p-4 cursor-pointer transition-colors ${
        isSelected
          ? "bg-violet-50 border-violet-200"
          : "hover:bg-violet-50/50"
      }`}
      onClick={onClick}
    >
      <h3 className="font-medium">
        {contact.name || contact.username || "Unknown Contact"}
      </h3>
    </Card>
  );
};
