import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, code } = await req.json()
    console.log(`Verifying code for phone number: ${phoneNumber}`)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Check if code exists and is valid
    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single()

    console.log('Verification data:', verificationData)
    
    if (verificationError || !verificationData) {
      console.error('Verification error:', verificationError)
      throw new Error(verificationError?.message || 'Invalid or expired code')
    }

    // Delete the used code
    const { error: deleteError } = await supabase
      .from('verification_codes')
      .delete()
      .eq('phone_number', phoneNumber)

    if (deleteError) {
      console.error('Error deleting verification code:', deleteError)
    }

    // Create or update user in auth
    const { data: userData, error: userError } = await supabase.auth.signUp({
      phone: phoneNumber,
      password: crypto.randomUUID(), // Generate a random password
    })

    if (userError) {
      console.error('Error creating user:', userError)
      throw userError
    }

    console.log('User created/updated successfully')

    return new Response(
      JSON.stringify({ success: true, session: userData.session }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in verify-code function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})