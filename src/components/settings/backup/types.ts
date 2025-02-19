
export interface BackupPoint {
  id: string;
  created_at: string;
  description: string | null;
  backup_type: 'manual' | 'automatic' | 'scheduled';
  status: 'pending' | 'completed' | 'failed';
}
