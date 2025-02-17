
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const token = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    console.log('Retrieved Mapbox token:', token ? 'Token exists' : 'Token missing');
    
    if (!token) {
      throw new Error('MAPBOX_PUBLIC_TOKEN is not set')
    }

    return new Response(
      JSON.stringify({ token }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      },
    )
  } catch (error) {
    console.error('Error in get-mapbox-token:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      },
    )
  }
})
