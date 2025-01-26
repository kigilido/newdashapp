interface Contact {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar?: string;
}

export const ContactsList = () => {
  const contacts: Contact[] = [
    {
      id: 1,
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      timestamp: "10:30 AM"
    },
    {
      id: 2,
      name: "Jane Smith",
      lastMessage: "See you tomorrow!",
      timestamp: "Yesterday"
    },
    {
      id: 3,
      name: "Mike Johnson",
      lastMessage: "Thanks for your help",
      timestamp: "2 days ago"
    }
  ];

  return (
    <div className="space-y-2 pb-4">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="glass-panel p-4 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{contact.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {contact.lastMessage}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {contact.timestamp}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};