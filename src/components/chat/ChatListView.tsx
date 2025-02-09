
import { ConversationList } from "@/components/ConversationList";
import { ContactsList } from "@/components/ContactsList";

interface ChatListViewProps {
  chatEnvironment: "general" | "contacts";
  conversations: any[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  handleContactSelect: (contactId: string) => void;
  handleNewConversation: () => void;
}

export const ChatListView = ({
  chatEnvironment,
  conversations,
  selectedConversation,
  setSelectedConversation,
  handleContactSelect,
  handleNewConversation,
}: ChatListViewProps) => {
  if (chatEnvironment === "contacts") {
    return (
      <ContactsList
        selectedId={selectedConversation}
        onSelect={handleContactSelect}
        onNewContact={handleNewConversation}
      />
    );
  }
  
  return (
    <ConversationList
      conversations={conversations}
      selectedId={selectedConversation}
      onSelect={setSelectedConversation}
      onNewConversation={handleNewConversation}
    />
  );
};
