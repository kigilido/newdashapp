
import { format } from "date-fns";
import { Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BackupPoint } from "./types";

interface BackupListProps {
  backupPoints: BackupPoint[] | null;
  isLoading: boolean;
  isRestoring: boolean;
  onRestore: (backup: BackupPoint) => void;
}

export const BackupList = ({
  backupPoints,
  isLoading,
  isRestoring,
  onRestore,
}: BackupListProps) => {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading backups...</p>;
  }

  if (!backupPoints?.length) {
    return <p className="text-sm text-muted-foreground">No backups found</p>;
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2">
        {backupPoints.map((backup) => (
          <div
            key={backup.id}
            className="flex items-center justify-between p-2 border rounded-lg"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {backup.description || 'Backup Point'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(new Date(backup.created_at), 'PPp')}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(backup)}
              disabled={isRestoring || backup.status === 'pending'}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restore
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
