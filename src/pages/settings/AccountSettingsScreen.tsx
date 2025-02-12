
import { AccountInfoSection } from "@/components/settings/AccountInfoSection";
import { EmailSection } from "@/components/settings/EmailSection";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { PhoneSection } from "@/components/settings/PhoneSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AccountSettingsScreen = () => {
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      // Try to get the profile first
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      // If there's an error other than "no rows", throw it
      if (error && !error.message.includes('no rows')) {
        throw error;
      }

      // If no profile exists, create one
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, email: user.email }])
          .select()
          .single();

        if (createError) throw createError;
        
        return {
          email: user.email,
          ...(newProfile || {})
        };
      }

      // Return existing profile
      return {
        email: user.email,
        ...profile
      };
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <AccountInfoSection 
        email={profile?.email}
        phoneNumber={profile?.phone_number}
        username={profile?.username}
        licensePlate={profile?.license_plate}
        createdAt={profile?.created_at}
        avatarUrl={profile?.avatar_url}
      />

      <EmailSection currentEmail={profile?.email} />
      
      <PasswordSection />
      
      <PhoneSection 
        currentPhoneNumber={profile?.phone_number}
        userId={profile?.id}
        onUpdate={refetchProfile}
      />
    </div>
  );
};

export default AccountSettingsScreen;
