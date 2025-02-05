
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminSettingsScreen = () => {
  // Verify admin access
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return data?.role === 'admin';
    }
  });

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You need administrator privileges to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Settings</h1>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Application Management</h2>
          <p className="text-muted-foreground">
            Welcome to the admin dashboard. Here you can manage application settings and configurations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsScreen;
