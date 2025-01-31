import Talk from "talkjs";
import { supabase } from "@/integrations/supabase/client";

let currentUser: Talk.User | null = null;
let currentSession: Talk.Session | null = null;

export const initTalkJS = async () => {
  try {
    await Talk.ready;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }

    if (!currentUser) {
      currentUser = new Talk.User({
        id: user.id,
        name: user.email || "Anonymous",
        photoUrl: "https://via.placeholder.com/150",
        role: "default",
      });
    }

    if (!currentSession) {
      const { data, error } = await supabase.functions.invoke('get-talkjs-app-id');
      
      if (error || !data?.secret) {
        console.error("Error getting TalkJS App ID:", error);
        return null;
      }

      currentSession = new Talk.Session({
        appId: data.secret,
        me: currentUser,
      });

      console.log("TalkJS session created successfully");
    }

    return currentSession;
  } catch (error) {
    console.error("Error initializing TalkJS:", error);
    return null;
  }
};

export const createOrGetConversation = async (otherUser: Talk.User) => {
  const session = await initTalkJS();
  if (!session || !currentUser) return null;

  const conversationId = Talk.oneOnOneId(currentUser, otherUser);
  const conversation = session.getOrCreateConversation(conversationId);
  
  conversation.setParticipant(currentUser);
  conversation.setParticipant(otherUser);

  console.log("Conversation created/retrieved successfully");
  return conversation;
};