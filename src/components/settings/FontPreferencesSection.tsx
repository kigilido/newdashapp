
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type FontStyle = "primary" | "body" | "accent";
type FontOption = "satoshi" | "inter" | "poppins";
type FontPreferences = Database['public']['Tables']['font_preferences']['Row'];

export const FontPreferencesSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current font preferences
  const { data: fontPreferences, isLoading } = useQuery<FontPreferences>({
    queryKey: ['fontPreferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('font_preferences')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no preferences exist, create default ones
      if (!data) {
        const defaultPrefs = {
          id: user.id,
          primary_font: 'satoshi',
          body_font: 'inter',
          accent_font: 'poppins'
        };

        const { data: newPrefs, error: insertError } = await supabase
          .from('font_preferences')
          .insert([defaultPrefs])
          .select()
          .single();

        if (insertError) throw insertError;
        return newPrefs;
      }

      return data;
    },
  });

  // Update font preference mutation
  const { mutate: updateFont } = useMutation({
    mutationFn: async ({ style, font }: { style: FontStyle; font: FontOption }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = {
        id: user.id,
        [`${style}_font`]: font
      };

      const { error } = await supabase
        .from('font_preferences')
        .upsert(updateData);

      if (error) throw error;
      return { style, font };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fontPreferences'] });
      toast({
        title: "Font Updated",
        description: `${data.style} font set to ${data.font}`,
      });
    },
  });

  // Apply fonts based on preferences
  useEffect(() => {
    if (!fontPreferences) return;

    const root = document.documentElement;
    root.style.setProperty('--font-primary', fontPreferences.primary_font);
    root.style.setProperty('--font-body', fontPreferences.body_font);
    root.style.setProperty('--font-accent', fontPreferences.accent_font);
  }, [fontPreferences]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Font Settings</CardTitle>
        </CardHeader>
        <CardContent>
          Loading...
        </CardContent>
      </Card>
    );
  }

  const fontCategories = [
    {
      label: "Primary (Headings)",
      style: "primary" as FontStyle,
      current: fontPreferences?.primary_font,
    },
    {
      label: "Body Text",
      style: "body" as FontStyle,
      current: fontPreferences?.body_font,
    },
    {
      label: "Accent Text",
      style: "accent" as FontStyle,
      current: fontPreferences?.accent_font,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Font Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {fontCategories.map((category) => (
          <div key={category.style} className="space-y-2">
            <h3 className="text-sm font-medium">{category.label}</h3>
            <ToggleGroup
              type="single"
              value={category.current}
              onValueChange={(value: FontOption) => {
                if (value) updateFont({ style: category.style, font: value });
              }}
              className="flex flex-wrap gap-2"
            >
              <ToggleGroupItem 
                value="satoshi"
                className="font-satoshi"
                aria-label="Satoshi font"
              >
                Satoshi
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="inter"
                className="font-sans"
                aria-label="Inter font"
              >
                Inter
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="poppins"
                className="font-poppins"
                aria-label="Poppins font"
              >
                Poppins
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
