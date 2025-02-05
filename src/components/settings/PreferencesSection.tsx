
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
        .maybeSingle();

      if (error) throw error;

      // If no preference exists, create one with default theme
      if (!data) {
        const { data: newPref, error: insertError } = await supabase
          .from('theme_preferences')
          .insert([{ id: user.id, theme: 'light' }])
          .select()
          .single();

        if (insertError) throw insertError;
        return newPref;
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

    const root = document.documentElement;
    if (themePreference.theme === "auto") {
      root.classList.remove('light', 'dark');
      root.classList.add(prefersDark.matches ? 'dark' : 'light');
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(themePreference.theme);
    }
  }, [themePreference, prefersDark.matches]);

  // Listen for system theme changes when auto is selected
  useEffect(() => {
    const handleChange = (e: MediaQueryListEvent) => {
      if (themePreference?.theme === "auto") {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(e.matches ? 'dark' : 'light');
      }
    };

    prefersDark.addEventListener("change", handleChange);
    return () => prefersDark.removeEventListener("change", handleChange);
  }, [themePreference?.theme]);

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
