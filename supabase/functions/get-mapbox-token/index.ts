
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    console.log('Attempting to retrieve Mapbox token');
    
    if (!token) {
      console.error('MAPBOX_PUBLIC_TOKEN is not set in environment variables');
      throw new Error('Mapbox token not configured');
    }

    console.log('Successfully retrieved Mapbox token');
    
    return new Response(
      JSON.stringify({ 
        token,
        status: 'success' 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      },
    );
  } catch (error) {
    console.error('Error in get-mapbox-token:', error.message);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        status: 'error'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      },
    );
  }
});
