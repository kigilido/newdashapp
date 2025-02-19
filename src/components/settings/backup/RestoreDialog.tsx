
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BackupPoint } from "./types";

interface RestoreDialogProps {
  backup: BackupPoint | null;
  isOpen: boolean;
  isRestoring: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const RestoreDialog = ({
  backup,
  isOpen,
  isRestoring,
  onOpenChange,
  onConfirm,
}: RestoreDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Restore</DialogTitle>
          <DialogDescription className="space-y-2">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mt-2">
              <AlertCircle className="h-5 w-5" />
              <p>
                This will restore your application to the state saved on{' '}
                {backup && format(new Date(backup.created_at), 'PPp')}
              </p>
            </div>
            <p>Are you sure you want to proceed?</p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isRestoring}
          >
            {isRestoring ? "Restoring..." : "Restore"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
