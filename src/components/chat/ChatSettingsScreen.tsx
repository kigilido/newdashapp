
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
    <div className="space-y-3">
      <h1 className="text-xl font-bold mb-2">Chat Settings</h1>

      {/* Notifications Section */}
      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="text-sm">Push Notifications</Label>
            <Switch id="push-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-notifications" className="text-sm">Sound Notifications</Label>
            <Switch 
              id="sound-notifications" 
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="read-receipts" className="text-sm">Read Receipts</Label>
            <Switch 
              id="read-receipts" 
              checked={readReceipts}
              onCheckedChange={setReadReceipts}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="last-seen" className="text-sm">Show Last Seen</Label>
            <Switch 
              id="last-seen" 
              checked={lastSeen}
              onCheckedChange={setLastSeen}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Chat Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm">Message Text Size ({fontSize}px)</Label>
            <Slider
              value={[fontSize]}
              onValueChange={handleFontSizeChange}
              min={12}
              max={24}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Theme</Label>
            <ToggleGroup type="single" value={theme} onValueChange={setTheme} className="justify-start">
              <ToggleGroupItem value="light" className="text-xs">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark" className="text-xs">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system" className="text-xs">System</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* Storage & Media */}
      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="h-4 w-4" />
            Storage & Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-download" className="text-sm">Auto-download Media</Label>
            <Switch 
              id="auto-download" 
              checked={autoDownload}
              onCheckedChange={setAutoDownload}
            />
          </div>
          <Button 
            variant="destructive" 
            onClick={handleClearHistory}
            className="w-full text-sm py-1 h-8"
          >
            Clear Chat History
          </Button>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AccessibilityIcon className="h-4 w-4" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="text-sm">High Contrast Mode</Label>
            <Switch id="high-contrast" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSettingsScreen;
