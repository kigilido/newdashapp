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
    console.log(`Attempting to verify code. Phone: ${phoneNumber}, Code: ${code}`)
    
    if (!phoneNumber || !code) {
      console.error('Missing required fields:', { phoneNumber: !!phoneNumber, code: !!code })
      throw new Error('Phone number and verification code are required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // First, clean up expired codes
    const { error: cleanupError } = await supabase
      .from('verification_codes')
      .delete()
      .lt('expires_at', new Date().toISOString())

    if (cleanupError) {
      console.error('Error cleaning up expired codes:', cleanupError)
    }

    // Log current time for debugging
    const currentTime = new Date().toISOString()
    console.log('Current time:', currentTime)

    // Check if code exists and is valid
    const { data: codes, error: listError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false })
      .limit(1)

    if (listError) {
      console.error('Error fetching verification codes:', listError)
      throw new Error('Database error while verifying code')
    }

    console.log('Found verification codes:', codes)

    const verificationCode = codes?.[0]
    
    if (!verificationCode) {
      console.error('No verification code found for this phone number')
      throw new Error('No verification code found')
    }

    if (new Date(verificationCode.expires_at) < new Date()) {
      console.error('Code has expired. Expiry:', verificationCode.expires_at)
      throw new Error('Code has expired')
    }

    if (verificationCode.code !== code) {
      console.error('Code mismatch. Expected:', verificationCode.code, 'Got:', code)
      throw new Error('Invalid code')
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
    const { data: { user, session }, error: userError } = await supabase.auth.signUp({
      phone: phoneNumber,
      password: crypto.randomUUID(), // Generate a random password
    })

    if (userError) {
      console.error('Error creating/updating user:', userError)
      throw userError
    }

    if (!session) {
      console.error('No session returned after authentication')
      throw new Error('Authentication failed - no session returned')
    }

    console.log('User authenticated successfully:', { userId: user?.id })

    return new Response(
      JSON.stringify({ success: true, session }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in verify-code function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during verification',
        details: error instanceof Error ? { stack: error.stack } : error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})