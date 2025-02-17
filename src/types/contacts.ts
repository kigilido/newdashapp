
export interface Contact {
  id: string;
  name?: string | null;
  contact_user_id: string;
  username?: string | null;
}

export interface ContactsListProps {
  contacts?: Contact[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onNewContact?: () => void;
}
