
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MessagesArea } from "@/components/MessagesArea";
import { ConversationList } from "@/components/ConversationList";
import { ContactsList } from "@/components/ContactsList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/components/chat/NotificationsHandler";
import { useSubscription } from "@/components/chat/SubscriptionManager";
import { useConversationState } from "@/components/chat/ConversationStateManager";
import { ChatEnvironmentToggle } from "@/components/chat/ChatEnvironmentToggle";
import { useToast } from "@/components/ui/use-toast";
import { Geolocation } from '@capacitor/geolocation';

const ChatScreen = () => {
  const [showConversations, setShowConversations] = useState(true);
  const [chatEnvironment, setChatEnvironment] = useState<"general" | "contacts">("general");
  const isMobile = useIsMobile();
  const { showNotification } = useNotifications();
  const { toast } = useToast();
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
    selectedConversationTitle
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

  const checkLocationPermission = async () => {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      
      if (permissionStatus.location === 'denied' || permissionStatus.location === 'prompt') {
        const request = await Geolocation.requestPermissions();
        
        if (request.location === 'granted') {
          toast({
            title: "Location Access Granted",
            description: "You can now share your location in chats",
          });
        } else {
          toast({
            title: "Location Access Required",
            description: "Please enable location access in your device settings to use location features",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      toast({
        title: "Permission Error",
        description: "Unable to check location permissions. Please try again.",
        variant: "destructive"
      });
    }
  };

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
    // It will create or load an existing conversation with the contact
  };

  const renderChatList = () => {
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

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-12rem)] relative">
        <ChatEnvironmentToggle 
          environment={chatEnvironment} 
          onToggle={handleToggleEnvironment} 
        />
        {showConversations ? (
          <div className="h-full overflow-y-auto">
            {renderChatList()}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <Button
                variant="ghost"
                onClick={handleBackToConversations}
                className="flex items-center gap-2 text-violet-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to {chatEnvironment === "contacts" ? "Contacts" : "Conversations"}
              </Button>
            </div>
            <Card className="flex-1 p-4 bg-white/50 backdrop-blur-sm border-white/20 flex flex-col">
              <MessagesArea
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
              />
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] relative">
      <ChatEnvironmentToggle 
        environment={chatEnvironment} 
        onToggle={handleToggleEnvironment} 
      />
      {showConversations ? (
        <div className="h-full overflow-y-auto">
          {renderChatList()}
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={handleBackToConversations}
              className="flex items-center gap-2 text-violet-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {chatEnvironment === "contacts" ? "Contacts" : "Conversations"}
            </Button>
          </div>
          <Card className="flex-1 p-4 bg-white/50 backdrop-blur-sm border-white/20 flex flex-col">
            <MessagesArea
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;

