
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const PreferencesSection = () => {
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const { toast } = useToast();

  // Check system dark mode preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  useEffect(() => {
    // Set initial theme based on system preference if auto is selected
    if (theme === "auto") {
      document.documentElement.classList.toggle("dark", prefersDark.matches);
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  // Listen for system theme changes when auto is selected
  useEffect(() => {
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "auto") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };

    prefersDark.addEventListener("change", handleChange);
    return () => prefersDark.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">Push Notifications</Label>
          <Switch id="notifications" />
        </div>
        
        <div className="space-y-3">
          <Label>Theme</Label>
          <RadioGroup
            value={theme}
            onValueChange={(value: "light" | "dark" | "auto") => {
              setTheme(value);
              toast({
                title: "Theme Updated",
                description: `Theme set to ${value} mode`,
              });
            }}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto">Auto (System)</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};
