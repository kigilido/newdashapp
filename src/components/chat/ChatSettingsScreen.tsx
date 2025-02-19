
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Bell, Lock, Palette, HardDrive, Languages, Users, Eye, AccessibilityIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNotifications } from "@/components/chat/NotificationsHandler";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ChatSettingsScreen = () => {
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("light");
  const [autoDownload, setAutoDownload] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { showNotification } = useNotifications();

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const handleClearHistory = () => {
    toast({
      title: "Chat History",
      description: "Chat history has been cleared",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chat Settings</h1>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch id="push-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-notifications">Sound Notifications</Label>
            <Switch 
              id="sound-notifications" 
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="read-receipts">Read Receipts</Label>
            <Switch 
              id="read-receipts" 
              checked={readReceipts}
              onCheckedChange={setReadReceipts}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="last-seen">Show Last Seen</Label>
            <Switch 
              id="last-seen" 
              checked={lastSeen}
              onCheckedChange={setLastSeen}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Chat Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Message Text Size ({fontSize}px)</Label>
            <Slider
              value={[fontSize]}
              onValueChange={handleFontSizeChange}
              min={12}
              max={24}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <ToggleGroup type="single" value={theme} onValueChange={setTheme} className="justify-start">
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system">System</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* Storage & Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage & Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-download">Auto-download Media</Label>
            <Switch 
              id="auto-download" 
              checked={autoDownload}
              onCheckedChange={setAutoDownload}
            />
          </div>
          <Button 
            variant="destructive" 
            onClick={handleClearHistory}
            className="w-full"
          >
            Clear Chat History
          </Button>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AccessibilityIcon className="h-5 w-5" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>High Contrast Mode</Label>
            <Switch id="high-contrast" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSettingsScreen;
