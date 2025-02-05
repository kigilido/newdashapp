
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountInfoSection } from "@/components/settings/AccountInfoSection";
import { EmailSection } from "@/components/settings/EmailSection";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { PhoneSection } from "@/components/settings/PhoneSection";
import { PreferencesSection } from "@/components/settings/PreferencesSection";
import { LogoutSection } from "@/components/settings/LogoutSection";

const SettingsScreen = () => {
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return {
        email: user.email,
        ...profile
      };
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <AccountInfoSection 
        email={profile?.email}
        phoneNumber={profile?.phone_number}
        createdAt={profile?.created_at}
      />

      <EmailSection currentEmail={profile?.email} />
      
      <PasswordSection />
      
      <PhoneSection 
        currentPhoneNumber={profile?.phone_number}
        userId={profile?.id}
        onUpdate={refetchProfile}
      />
      
      <PreferencesSection />
      
      <LogoutSection />
    </div>
  );
};

export default SettingsScreen;
