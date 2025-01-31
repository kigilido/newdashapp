import Talk from "talkjs";
import { supabase } from "@/integrations/supabase/client";

let currentUser: Talk.User | null = null;
let currentSession: Talk.Session | null = null;

export const initTalkJS = async () => {
  try {
    await Talk.ready;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Authentication error:", authError);
      return null;
    }
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }

    console.log("Authenticated user:", user.email);

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

      console.log("Got TalkJS App ID successfully");

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
  if (!session || !currentUser) {
    console.error("Failed to get session or current user");
    return null;
  }

  const conversationId = Talk.oneOnOneId(currentUser, otherUser);
  const conversation = session.getOrCreateConversation(conversationId);
  
  conversation.setParticipant(currentUser);
  conversation.setParticipant(otherUser);

  console.log("Conversation created/retrieved successfully");
  return conversation;
};