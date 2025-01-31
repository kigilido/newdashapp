declare module "talkjs" {
  export default interface Talk {
    ready: Promise<void>;
    oneOnOneId(user1: Talk.User, user2: Talk.User): string;
    User: new (options: {
      id: string;
      name: string;
      photoUrl?: string;
      role?: string;
    }) => Talk.User;
    Session: new (options: {
      appId: string;
      me: Talk.User;
    }) => Talk.Session;
  }

  namespace Talk {
    interface User {
      id: string;
      name: string;
      photoUrl?: string;
      role?: string;
    }

    interface Session {
      createInbox(): Inbox;
      getOrCreateConversation(id: string): Conversation;
    }

    interface Inbox {
      mount(element: HTMLElement): void;
    }

    interface Conversation {
      setParticipant(user: User): void;
    }
  }

  const Talk: Talk;
  export = Talk;
}