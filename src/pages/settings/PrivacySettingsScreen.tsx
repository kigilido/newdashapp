
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const PrivacySettingsScreen = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Privacy Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Privacy settings coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettingsScreen;
