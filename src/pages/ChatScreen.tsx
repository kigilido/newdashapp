
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MessagesArea } from "@/components/MessagesArea";
import { ConversationList } from "@/components/ConversationList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/components/chat/NotificationsHandler";
import { useSubscription } from "@/components/chat/SubscriptionManager";
import { useConversationState } from "@/components/chat/ConversationStateManager";

const ChatScreen = () => {
  const [showConversations, setShowConversations] = useState(true);
  const isMobile = useIsMobile();
  const { showNotification } = useNotifications();
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

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-12rem)]">
        {showConversations ? (
          <div className="h-full overflow-y-auto">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation}
              onSelect={setSelectedConversation}
              onNewConversation={handleNewConversation}
            />
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
                Back to Conversations
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
    <div className="h-[calc(100vh-12rem)]">
      {showConversations ? (
        <div className="h-full overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation}
            onSelect={setSelectedConversation}
            onNewConversation={handleNewConversation}
          />
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
              Back to Conversations
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
