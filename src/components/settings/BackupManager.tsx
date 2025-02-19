
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, RotateCcw, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface BackupPoint {
  id: string;
  created_at: string;
  description: string | null;
  backup_type: 'manual' | 'automatic' | 'scheduled';
  status: 'pending' | 'completed' | 'failed';
}

export const BackupManager = () => {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupPoint | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch backup points
  const { data: backupPoints, isLoading } = useQuery({
    queryKey: ['backupPoints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backup_points')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BackupPoint[];
    },
  });

  // Create backup mutation
  const { mutate: createBackup, isPending: isCreatingBackup } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .rpc('create_backup_point', {
          p_description: 'Manual backup',
          p_backup_type: 'manual'
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupPoints'] });
      toast({
        title: "Backup created",
        description: "Your application state has been backed up successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Backup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Restore backup mutation
  const { mutate: restoreBackup, isPending: isRestoring } = useMutation({
    mutationFn: async (backupId: string) => {
      const { data, error } = await supabase
        .rpc('restore_from_backup', {
          p_backup_point_id: backupId
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setShowRestoreDialog(false);
      setSelectedBackup(null);
      toast({
        title: "Restore completed",
        description: "Your application state has been restored successfully.",
      });
      // Reload the page to reflect restored state
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Restore failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRestore = (backup: BackupPoint) => {
    setSelectedBackup(backup);
    setShowRestoreDialog(true);
  };

  const confirmRestore = () => {
    if (selectedBackup) {
      restoreBackup(selectedBackup.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Backup & Restore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => createBackup()}
          disabled={isCreatingBackup}
          className="w-full"
        >
          Create Backup
        </Button>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recent Backups</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading backups...</p>
          ) : !backupPoints?.length ? (
            <p className="text-sm text-muted-foreground">No backups found</p>
          ) : (
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
                      onClick={() => handleRestore(backup)}
                      disabled={isRestoring}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Restore</DialogTitle>
              <DialogDescription className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mt-2">
                  <AlertCircle className="h-5 w-5" />
                  <p>
                    This will restore your application to the state saved on{' '}
                    {selectedBackup && format(new Date(selectedBackup.created_at), 'PPp')}
                  </p>
                </div>
                <p>Are you sure you want to proceed?</p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRestoreDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRestore}
                disabled={isRestoring}
              >
                {isRestoring ? "Restoring..." : "Restore"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
