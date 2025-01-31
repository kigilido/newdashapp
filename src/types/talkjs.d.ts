declare module "talkjs" {
  export interface User {
    id: string;
    name: string;
    photoUrl?: string;
    role?: string;
  }

  export interface Session {
    createInbox(): Inbox;
    getOrCreateConversation(id: string): Conversation;
    createChatbox(conversation: Conversation): Chatbox;
    me: User;
  }

  export interface Inbox {
    mount(element: HTMLElement): void;
  }

  export interface Conversation {
    setParticipant(user: User): void;
  }

  export interface Chatbox {
    mount(element: HTMLElement): void;
  }

  export const ready: Promise<void>;
  export function oneOnOneId(user1: User, user2: User): string;
  
  export class User {
    constructor(options: {
      id: string;
      name: string;
      photoUrl?: string;
      role?: string;
    });
  }
  
  export class Session {
    constructor(options: {
      appId: string;
      me: User;
    });
    me: User;
    createChatbox(conversation: Conversation): Chatbox;
    getOrCreateConversation(id: string): Conversation;
  }

  export default Talk;
}