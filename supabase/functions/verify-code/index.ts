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
    console.log(`Verifying code for phone number: ${phoneNumber}, code: ${code}`)
    
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

    // Check if code exists and is valid
    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single()

    console.log('Verification query result:', { 
      found: !!verificationData,
      error: verificationError?.message || 'none'
    })
    
    if (verificationError) {
      console.error('Database error:', verificationError)
      throw new Error('Database error while verifying code')
    }

    if (!verificationData) {
      console.error('No valid verification code found')
      throw new Error('Invalid or expired code')
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