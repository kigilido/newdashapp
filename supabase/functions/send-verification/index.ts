import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber } = await req.json()
    console.log('Received request to send verification code to:', phoneNumber)

    // Validate phone number format
    if (!phoneNumber || !phoneNumber.match(/^\+1\d{10}$/)) {
      throw new Error('Invalid phone number format. Must be +1 followed by 10 digits')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!accountSid || !authToken || !twilioPhone) {
      console.error('Missing Twilio credentials')
      throw new Error('Server configuration error: Missing Twilio credentials')
    }

    console.log('Twilio configuration found:', { accountSid, twilioPhone })

    const otp = generateOTP()
    console.log('Generated OTP:', otp)
    
    // Store OTP in Supabase with expiration
    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        phone_number: phoneNumber,
        code: otp,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes expiration
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to store verification code')
    }

    console.log('OTP stored in database successfully')

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    console.log('Sending SMS via Twilio...')
    
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`)
      },
      body: new URLSearchParams({
        To: phoneNumber,
        From: twilioPhone,
        Body: `Your DASH verification code is: ${otp}`
      })
    })

    const twilioData = await twilioResponse.json()
    console.log('Twilio API response:', twilioData)

    if (!twilioResponse.ok) {
      // Check if the error is due to unverified number
      if (twilioData.code === 21608) {
        return new Response(
          JSON.stringify({ 
            error: "Trial account restriction: Please verify your phone number first",
            verificationRequired: true,
            verificationUrl: "https://www.twilio.com/console/phone-numbers/verified"
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        )
      }

      // Log detailed Twilio error
      console.error('Twilio error details:', {
        status: twilioResponse.status,
        statusText: twilioResponse.statusText,
        data: twilioData
      })
      
      throw new Error(`Twilio error: ${twilioData.message || 'Failed to send SMS'}`)
    }

    console.log('SMS sent successfully')

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-verification function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})