
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

export const useConversationState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedConversationTitle, setSelectedConversationTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the chat.",
        variant: "destructive",
      });
      navigate("/auth");
      return false;
    }
    return true;
  };

  const loadConversations = async () => {
    try {
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      if (!conversationsData) {
        throw new Error('No conversations data received');
      }

      setConversations(conversationsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data: messageData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get the participants
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId);

      if (participants) {
        // Find the other participant (not the current user)
        const otherParticipant = participants.find(p => p.user_id !== user.id);
        
        if (otherParticipant) {
          // Get the profile of the other participant
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', otherParticipant.user_id)
            .single();

          setSelectedConversationTitle(profile?.username || "Chat");
        } else {
          setSelectedConversationTitle("Chat");
        }
      }

      setMessages(messageData || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newMessage = {
        content,
        conversation_id: selectedConversation,
        sender_id: user.id,
        created_at: new Date().toISOString(),
        id: crypto.randomUUID()
      };

      setMessages(prev => [...prev, newMessage]);

      const { error } = await supabase
        .from('messages')
        .insert([{
          content,
          conversation_id: selectedConversation,
          sender_id: user.id
        }]);

      if (error) {
        setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        throw error;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewConversation = async () => {
    setIsLoading(true);
    await loadConversations();
  };

  return {
    messages,
    setMessages,
    conversations,
    selectedConversation,
    setSelectedConversation,
    selectedConversationTitle,
    isLoading,
    setIsLoading,
    checkAuth,
    loadConversations,
    loadMessages,
    handleSendMessage,
    handleNewConversation
  };
};
