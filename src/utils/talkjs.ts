import { supabase } from "@/integrations/supabase/client";

// Access the global Talk object that was loaded via the script tag
declare const Talk: typeof import("talkjs");

let currentUser: Talk.User | null = null;
let currentSession: Talk.Session | null = null;

export const initTalkJS = async () => {
  await Talk.ready;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  if (!currentUser) {
    currentUser = new Talk.User({
      id: user.id,
      name: user.phone || "Anonymous",
      photoUrl: "https://via.placeholder.com/150",
      role: "default",
    });
  }

  if (!currentSession) {
    const appId = import.meta.env.VITE_TALKJS_APP_ID;
    currentSession = new Talk.Session({
      appId,
      me: currentUser,
    });
  }

  return currentSession;
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