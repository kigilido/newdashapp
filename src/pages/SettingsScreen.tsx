
import { useNavigate } from "react-router-dom";
import { 
  UserCircle, 
  Settings as SettingsIcon, 
  Shield,
  ChevronRight,
  Settings2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutSection } from "@/components/settings/LogoutSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SettingsScreen = () => {
  const navigate = useNavigate();

  const { data: userRole } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First check if user has a role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      // If no role exists yet, create default 'user' role
      if (!data) {
        const { data: newRole, error: insertError } = await supabase
          .from('user_roles')
          .insert([{ user_id: user.id, role: 'user' }])
          .select('role')
          .single();
          
        if (insertError) {
          console.error('Error creating user role:', insertError);
          return null;
        }
        return newRole?.role;
      }

      return data?.role;
    }
  });

  const settingsCategories = [
    {
      title: "Account Information",
      icon: UserCircle,
      path: "/app/settings/account",
      description: "Manage your account details, email, and password"
    },
    {
      title: "General",
      icon: SettingsIcon,
      path: "/app/settings/general",
      description: "App preferences and customization"
    },
    {
      title: "Privacy",
      icon: Shield,
      path: "/app/settings/privacy",
      description: "Control your privacy and security settings"
    },
    // Only show admin settings if user has admin role
    ...(userRole === 'admin' ? [{
      title: "Admin Settings",
      icon: Settings2,
      path: "/app/settings/admin",
      description: "Manage application settings and configurations"
    }] : [])
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="space-y-3">
        {settingsCategories.map((category) => (
          <Card
            key={category.title}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate(category.path)}
          >
            <CardContent className="flex items-center p-4">
              <category.icon className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-medium">{category.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <LogoutSection />
    </div>
  );
};

export default SettingsScreen;
