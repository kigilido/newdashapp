
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/components/chat/NotificationsHandler";
import { useSubscription } from "@/components/chat/SubscriptionManager";
import { useConversationState } from "@/components/chat/ConversationStateManager";
import { ChatEnvironmentToggle } from "@/components/chat/ChatEnvironmentToggle";
import { useLocationPermission } from "@/components/chat/LocationPermissionHandler";
import { ChatView } from "@/components/chat/ChatView";
import { ChatListView } from "@/components/chat/ChatListView";

const ChatScreen = () => {
  const [showConversations, setShowConversations] = useState(true);
  const [chatEnvironment, setChatEnvironment] = useState<"general" | "contacts">("contacts");
  const isMobile = useIsMobile();
  const { showNotification } = useNotifications();
  const { checkLocationPermission } = useLocationPermission();
  
  const {
    messages,
    setMessages,
    conversations,
    selectedConversation,
    setSelectedConversation,
    isLoading,
    checkAuth,
    loadConversations,
    loadMessages,
    handleSendMessage,
    handleNewConversation,
  } = useConversationState();

  useEffect(() => {
    const initialize = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await loadConversations();
        await checkLocationPermission();
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      setShowConversations(false);
    }
  }, [selectedConversation]);

  useSubscription({
    conversationId: selectedConversation || '',
    onNewMessage: (newMessage) => {
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (!exists) {
          showNotification(newMessage);
          return [...prev, newMessage];
        }
        return prev;
      });
    }
  });

  const handleBackToConversations = () => {
    setShowConversations(true);
    setSelectedConversation(null);
  };

  const handleToggleEnvironment = () => {
    setChatEnvironment(prev => prev === "general" ? "contacts" : "general");
    setSelectedConversation(null);
    setShowConversations(true);
  };

  const handleContactSelect = async (contactId: string) => {
    // This function will be implemented when contact selection is needed
    console.log("Contact selected:", contactId);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-none py-2">
        <ChatEnvironmentToggle 
          environment={chatEnvironment} 
          onToggle={handleToggleEnvironment} 
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        {showConversations ? (
          <div className="h-full overflow-y-auto">
            <ChatListView
              chatEnvironment={chatEnvironment}
              conversations={conversations}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
              handleContactSelect={handleContactSelect}
              handleNewConversation={handleNewConversation}
            />
          </div>
        ) : (
          <ChatView
            messages={messages}
            isLoading={isLoading}
            handleSendMessage={handleSendMessage}
            handleBackToConversations={handleBackToConversations}
            chatEnvironment={chatEnvironment}
          />
        )}
      </div>
    </div>
  );
};

export default ChatScreen;
