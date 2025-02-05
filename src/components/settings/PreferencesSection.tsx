
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, Monitor } from "lucide-react";

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
    const setTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (themePreference.theme === "auto") {
      setTheme(prefersDark.matches);
    } else {
      setTheme(themePreference.theme === "dark");
    }
  }, [themePreference, prefersDark.matches]);

  // Listen for system theme changes when auto is selected
  useEffect(() => {
    const handleChange = (e: MediaQueryListEvent) => {
      if (themePreference?.theme === "auto") {
        const root = document.documentElement;
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    prefersDark.addEventListener("change", handleChange);
    return () => prefersDark.removeEventListener("change", handleChange);
  }, [themePreference?.theme]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          Loading...
        </CardContent>
      </Card>
    );
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'System', icon: Monitor },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">Push Notifications</Label>
          <Switch id="notifications" />
        </div>
        
        <div className="space-y-3">
          <Label>Theme</Label>
          <div className="grid grid-cols-3 gap-4">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  themePreference?.theme === value
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/50 text-violet-900 dark:text-violet-100'
                    : 'border-border hover:border-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-900/20'
                }`}
                onClick={() => updateTheme(value)}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
