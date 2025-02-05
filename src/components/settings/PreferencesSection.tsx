
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const PreferencesSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check system dark mode preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  // Fetch current theme preference
  const { data: themePreference, isLoading } = useQuery({
    queryKey: ['themePreference'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('theme_preferences')
        .select('theme')
        .eq('id', user.id)
        .single();

      if (error) {
        // If no preference exists, create one with default theme
        if (error.code === 'PGRST116') {
          const { data: newPref } = await supabase
            .from('theme_preferences')
            .insert([{ id: user.id, theme: 'light' }])
            .select()
            .single();
          return newPref;
        }
        throw error;
      }

      return data;
    },
  });

  // Update theme preference mutation
  const { mutate: updateTheme } = useMutation({
    mutationFn: async (newTheme: "light" | "dark" | "auto") => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('theme_preferences')
        .upsert({ id: user.id, theme: newTheme });

      if (error) throw error;
      return newTheme;
    },
    onSuccess: (newTheme) => {
      queryClient.setQueryData(['themePreference'], { theme: newTheme });
      toast({
        title: "Theme Updated",
        description: `Theme set to ${newTheme} mode`,
      });
    },
  });

  // Apply theme based on preference and system setting
  useEffect(() => {
    if (!themePreference) return;

    if (themePreference.theme === "auto") {
      document.documentElement.classList.toggle("dark", prefersDark.matches);
    } else {
      document.documentElement.classList.toggle("dark", themePreference.theme === "dark");
    }
  }, [themePreference, prefersDark.matches]);

  // Listen for system theme changes when auto is selected
  useEffect(() => {
    const handleChange = (e: MediaQueryListEvent) => {
      if (themePreference?.theme === "auto") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };

    prefersDark.addEventListener("change", handleChange);
    return () => prefersDark.removeEventListener("change", handleChange);
  }, [themePreference]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          Loading...
        </CardContent>
      </Card>
    );
  }

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
            value={themePreference?.theme || 'light'}
            onValueChange={(value: "light" | "dark" | "auto") => {
              updateTheme(value);
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
