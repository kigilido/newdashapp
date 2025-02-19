
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

    // Extract base64 data - handle both with and without data URI prefix
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

    // Create form data for the Mindee API
    const formData = new FormData();
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    // Append the image file to form data
    formData.append('document', blob, 'license_plate.jpg');

    console.log('Sending request to Mindee API...');

    // Send image to Mindee API for license plate detection
    const response = await fetch('https://api.mindee.net/v1/products/mindee/license_plates/v1/predict', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${MINDEE_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mindee API error:', errorText);
      throw new Error(`Mindee API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Mindee API response:', data);

    if (!data.document || !data.document.inference || !data.document.inference.prediction) {
      throw new Error('Invalid response format from Mindee API');
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
          status: 200
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
        status: 200
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 200, // Changed to 200 to prevent the non-2xx error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})
