
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { CompleteProfileForm } from "./CompleteProfileForm"

export const ProfileUpdateCheck = ({ children }: { children: React.ReactNode }) => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-update-check'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data: profile } = await supabase
        .from('profiles')
        .select('has_completed_profile_update')
        .eq('id', user.id)
        .single()

      return profile
    },
  })

  if (isLoading) return null

  if (!profile?.has_completed_profile_update) {
    return <CompleteProfileForm />
  }

  return children
}
