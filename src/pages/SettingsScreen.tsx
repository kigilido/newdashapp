
import { useNavigate } from "react-router-dom";
import { 
  UserCircle, 
  Settings as SettingsIcon, 
  Shield,
  ChevronRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutSection } from "@/components/settings/LogoutSection";

const SettingsScreen = () => {
  const navigate = useNavigate();

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
