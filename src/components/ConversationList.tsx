
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "./ui/avatar";

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
  const [recipientUsername, setRecipientUsername] = useState("");
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, get the recipient user from profiles by username
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', recipientUsername);

      if (profileError || !profiles || profiles.length === 0) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      const recipientProfile = profiles[0];

      // Create the conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert([{
          title: `${recipientProfile.username}`,
          type: 'direct',
          creator_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      try {
        // Add both users as participants
        await supabase
          .from('conversation_participants')
          .insert([
            {
              conversation_id: conversation.id,
              user_id: user.id
            },
            {
              conversation_id: conversation.id,
              user_id: recipientProfile.id
            }
          ]);

        setRecipientUsername("");
        setIsCreating(false);
        onNewConversation();
        
        toast({
          title: "Success",
          description: "Chat created successfully",
        });
      } catch (error: any) {
        if (error?.message?.includes('unique constraint')) {
          toast({
            title: "Chat exists",
            description: "A conversation with this user already exists",
            variant: "destructive",
          });
          // Clean up the conversation we just created since we couldn't add participants
          await supabase
            .from('conversations')
            .delete()
            .eq('id', conversation.id);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      });
    }
  };

  const getUsername = (title: string | null) => {
    if (!title) return "New Chat";
    if (title.startsWith("Chat with ")) {
      return title.replace("Chat with ", "");
    }
    return title;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-4 py-2">
        {isCreating ? (
          <div className="flex flex-col gap-2 w-full">
            <Input
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              placeholder="Enter username..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateConversation} className="flex-1">Create</Button>
              <Button variant="ghost" onClick={() => {
                setIsCreating(false);
                setRecipientUsername("");
              }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsCreating(true)}
            variant="ghost"
            className="w-full flex items-center gap-2 hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        )}
      </div>
      <div className="space-y-[1px] bg-gray-200">
        {conversations.map((conv) => {
          const username = getUsername(conv.title);
          return (
            <div
              key={conv.id}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors bg-white hover:bg-gray-50 ${
                selectedId === conv.id ? "bg-gray-100" : ""
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-violet-100 text-violet-600">
                  {getInitials(username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-gray-900 truncate">
                    {username}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(conv.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  Click to view conversation
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
