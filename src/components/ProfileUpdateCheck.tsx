
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { CompleteProfileForm } from "./CompleteProfileForm"
import { Navigate } from "react-router-dom"

export const ProfileUpdateCheck = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    },
  })

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
    enabled: !!session, // Only run this query if we have a session
  })

  // If there's no session, redirect to auth
  if (!session) {
    return <Navigate to="/auth" replace />
  }

  // Show loading state while checking profile
  if (isLoading) return null

  // If logged in but profile not completed, show form
  if (!profile?.has_completed_profile_update) {
    return <CompleteProfileForm />
  }

  // If logged in and profile completed, show children
  return children
}
