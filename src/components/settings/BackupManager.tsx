
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BackupList } from "./backup/BackupList";
import { RestoreDialog } from "./backup/RestoreDialog";
import { BackupPoint } from "./backup/types";

export const BackupManager = () => {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupPoint | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: backupPoints, isLoading } = useQuery({
    queryKey: ['backupPoints'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('backup_points')
        .select('id, created_at, description, backup_type, status')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BackupPoint[];
    },
  });

  const { mutate: createBackup, isPending: isCreatingBackup } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('create_backup_point', {
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

  const { mutate: restoreBackup, isPending: isRestoring } = useMutation({
    mutationFn: async (backupId: string) => {
      const { data, error } = await supabase.rpc('restore_from_backup', {
        p_backup_point_id: backupId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setShowRestoreDialog(false);
      setSelectedBackup(null);
      toast({
        title: "Restore initiated",
        description: "Your application state is being restored.",
      });
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
          <BackupList
            backupPoints={backupPoints}
            isLoading={isLoading}
            isRestoring={isRestoring}
            onRestore={handleRestore}
          />
        </div>

        <RestoreDialog
          backup={selectedBackup}
          isOpen={showRestoreDialog}
          isRestoring={isRestoring}
          onOpenChange={setShowRestoreDialog}
          onConfirm={confirmRestore}
        />
      </CardContent>
    </Card>
  );
};
