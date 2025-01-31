import { supabase } from "@/integrations/supabase/client";
import * as Talk from "talkjs";

let currentUser: Talk.User | null = null;
let currentSession: Talk.Session | null = null;

export const initTalkJS = async () => {
  try {
    await Talk.ready;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No authenticated user found");
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
      const { data: { secret } } = await supabase.functions.invoke('get-talkjs-app-id');
      const appId = secret;
      
      if (!appId) {
        console.error("TalkJS App ID not found");
        return null;
      }

      currentSession = new Talk.Session({
        appId,
        me: currentUser,
      });
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

  return conversation;
};