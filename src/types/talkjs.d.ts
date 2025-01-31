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
  }

  export interface Inbox {
    mount(element: HTMLElement): void;
  }

  export interface Conversation {
    setParticipant(user: User): void;
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
  }
}

export {};