
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface LocationSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}

export const LocationSearch = ({ searchQuery, setSearchQuery, onSearch }: LocationSearchProps) => {
  return (
    <div className="relative flex-1">
      <Input
        type="text"
        placeholder="Search location..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        className="pl-10"
      />
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer" 
        onClick={onSearch}
      />
    </div>
  );
};
