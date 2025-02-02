import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  onNewConversation,
}: ConversationListProps) => {
  const [newTitle, setNewTitle] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, get the recipient user's presence
      const { data: recipientPresence, error: presenceError } = await supabase
        .from('user_presence')
        .select('user_id')
        .eq('status', 'online')
        .single();

      if (presenceError || !recipientPresence) {
        toast({
          title: "Error",
          description: "Recipient user not found or not online",
          variant: "destructive",
        });
        return;
      }

      // Create the conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert([{
          title: newTitle || 'New Chat',
          type: 'direct',
          creator_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Add both users as participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: conversation.id,
            user_id: user.id
          },
          {
            conversation_id: conversation.id,
            user_id: recipientPresence.user_id
          }
        ]);

      if (participantsError) throw participantsError;

      setNewTitle("");
      setRecipientEmail("");
      setIsCreating(false);
      onNewConversation();
      
      toast({
        title: "Success",
        description: "Chat created successfully",
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isCreating ? (
          <div className="flex flex-col gap-2 w-full">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Chat name..."
              className="flex-1"
            />
            <Input
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Recipient email..."
              type="email"
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateConversation} className="flex-1">Create</Button>
              <Button variant="ghost" onClick={() => {
                setIsCreating(false);
                setNewTitle("");
                setRecipientEmail("");
              }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsCreating(true)}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {conversations.map((conv) => (
          <Card
            key={conv.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedId === conv.id
                ? "bg-violet-50 border-violet-200"
                : "hover:bg-violet-50/50"
            }`}
            onClick={() => onSelect(conv.id)}
          >
            <h3 className="font-medium">
              {conv.title || "New Chat"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {new Date(conv.created_at).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};