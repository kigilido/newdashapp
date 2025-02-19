
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MINDEE_API_KEY = Deno.env.get('MINDEE_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()

    if (!image) {
      throw new Error('No image data provided')
    }

    // Convert base64 to binary
    const base64Data = image.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Send image to Mindee API for license plate detection
    const response = await fetch('https://api.mindee.net/v1/products/mindee/license_plates/v1/predict', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${MINDEE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: base64Data
      })
    });

    const data = await response.json()
    console.log('Mindee API response:', data);

    if (!data.document || !data.document.inference || !data.document.inference.prediction) {
      throw new Error('Invalid response from Mindee API')
    }

    const prediction = data.document.inference.prediction;
    const licensePlates = prediction.license_plates || [];

    if (licensePlates.length === 0) {
      return new Response(
        JSON.stringify({
          licensePlate: 'NO_PLATE_FOUND',
          rawText: 'No license plate detected in the image'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the first detected license plate
    const detectedPlate = licensePlates[0];
    
    return new Response(
      JSON.stringify({
        licensePlate: detectedPlate.value.toUpperCase(),
        rawText: `Confidence: ${detectedPlate.confidence}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
